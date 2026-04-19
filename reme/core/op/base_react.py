"""Base memory agent for handling memory operations with tool-based reasoning."""

import asyncio
from typing import TYPE_CHECKING

from loguru import logger

from ..enumeration import Role
from ..op import BaseOp
from ..schema import Message

if TYPE_CHECKING:
    from . import BaseTool


class BaseReact(BaseOp):
    """ReAct agent that performs reasoning and acting cycles with tools."""

    def __init__(
        self,
        tools: list["BaseTool"],
        tool_call_interval: float = 0,
        max_steps: int = 10,
        **kwargs,
    ):
        """Initialize ReAct agent with tools and execution parameters."""
        kwargs["sub_ops"] = tools or []
        super().__init__(**kwargs)
        # Filter only BaseTool instances from sub_ops
        from . import BaseTool

        self.sub_ops: list[BaseTool] = [t for t in self.sub_ops if isinstance(t, BaseTool)]
        self.tool_call_interval: float = tool_call_interval
        self.max_steps: int = max_steps

    @property
    def tools(self) -> list["BaseTool"]:
        """Return available tools for the agent."""
        return self.sub_ops

    def pop_tool(self, name: str) -> "BaseTool | None":
        """Remove and return a tool from self.tools by name."""
        for i, tool in enumerate(self.sub_ops):
            if tool.tool_call.name == name:
                return self.sub_ops.pop(i)
        return None

    async def build_messages(self) -> list[Message]:
        """Build initial message list from context query or messages."""
        if self.context.get("query"):
            messages = [Message(role=Role.USER, content=self.context.query)]
        elif self.context.get("messages"):
            messages = [Message(**m) if isinstance(m, dict) else m for m in self.context.messages]
        else:
            raise ValueError("input must have either `query` or `messages`")
        return messages

    async def _reasoning_step(
        self,
        messages: list[Message],
        tools: list["BaseTool"],
        step: int,
        stage: str = "",
        **kwargs,
    ) -> tuple[Message, bool]:
        """Execute one reasoning step where LLM decides whether to use tools."""
        # Get tool definitions for LLM
        tool_calls = [t.tool_call for t in tools]

        # Generate assistant response with potential tool calls
        assistant_message: Message = await self.llm.chat(messages=messages, tools=tool_calls, **kwargs)
        messages.append(assistant_message)
        assistant_content: str = assistant_message.simple_dump(as_dict=False)
        logger.info(f"[{self.__class__.__name__} {stage or ''} step{step}] assistant={assistant_content}")

        # Determine if tools should be called
        should_act = bool(assistant_message.tool_calls)
        return assistant_message, should_act

    async def _acting_step(
        self,
        assistant_message: Message,
        tools: list["BaseTool"],
        step: int,
        stage: str = "",
        **kwargs,
    ) -> tuple[list["BaseTool"], list[Message]]:
        """Execute tool calls requested by the assistant and collect results."""
        tool_list: list["BaseTool"] = []
        tool_messages: list[Message] = []

        if not assistant_message.tool_calls:
            return tool_list, tool_messages

        # Create tool name to tool instance mapping
        tool_dict = {t.tool_call.name: t for t in tools}
        for j, tool_call in enumerate(assistant_message.tool_calls):
            prefix: str = f"[{self.__class__.__name__} {stage or ''} step{step}.{j}]"
            if tool_call.name not in tool_dict:
                logger.warning(f"{prefix} unknown tool_call={tool_call.name}")
                continue

            logger.info(f"{prefix} submit tool_call[{tool_call.name}] arguments={tool_call.arguments}")

            # Create independent tool copy with unique ID
            tool_copy: BaseTool = tool_dict[tool_call.name].copy()
            tool_copy.tool_call.id = tool_call.id
            tool_list.append(tool_copy)

            # Create isolated kwargs for each tool call to avoid parameter conflicts
            tool_kwargs = {**kwargs, **tool_call.argument_dict}
            self.submit_async_task(tool_copy.call, service_context=self.service_context, **tool_kwargs)
            if self.tool_call_interval > 0:
                await asyncio.sleep(self.tool_call_interval)

        # Wait for all tool executions to complete
        await self.join_async_tasks()

        # Collect tool results as messages
        for j, tool in enumerate(tool_list):
            tool_messages.append(
                Message(
                    role=Role.TOOL,
                    content=tool.response.answer,
                    tool_call_id=tool.tool_call.id,
                ),
            )
            prefix: str = f"[{self.__class__.__name__} {stage or ''} step{step}.{j}]"
            logger.info(f"{prefix} join tool={tool.name} result={tool.response.answer}")
        return tool_list, tool_messages

    async def react(self, messages: list[Message], tools: list["BaseTool"], stage: str = ""):
        """Run ReAct loop alternating between reasoning and acting until completion."""
        success: bool = False
        used_tools: list[BaseTool] = []
        for step in range(self.max_steps):
            # Reasoning: LLM decides next action
            assistant_message, should_act = await self._reasoning_step(messages, tools, step=step, stage=stage)

            if not should_act:
                # No tools requested, task complete
                success = True
                break

            # Acting: execute tools and collect results
            t_tools, tool_messages = await self._acting_step(assistant_message, tools, step=step, stage=stage)
            used_tools.extend(t_tools)
            messages.extend(tool_messages)

        return used_tools, messages, success

    async def execute(self):
        """Execute the ReAct agent and return final results."""
        # Log available tools
        for i, tool in enumerate(self.tools):
            logger.info(f"[{self.__class__.__name__}] {i}.tool_call={tool.tool_call.simple_input_dump(as_dict=False)}")

        # Build and log initial messages
        messages = await self.build_messages()
        for i, message in enumerate(messages):
            role = message.name or message.role
            logger.info(f"[{self.__class__.__name__}] role={role} {message.simple_dump(as_dict=False)}")

        # Run ReAct loop
        t_tools, messages, success = await self.react(messages, self.tools)

        # Get the last assistant message as the final answer
        assistant_messages = [m for m in messages if m.role == Role.ASSISTANT]
        answer = assistant_messages[-1].content if assistant_messages else ""

        return {
            "answer": answer,
            "success": success,
            "messages": messages,
            "tools": t_tools,
        }
