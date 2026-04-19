# -*- coding: utf-8 -*-
"""Utilities for converting between DashScope format and AgentScope Msg format."""

import json
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from agentscope.message import Msg


class DashScopeToAgentScopeConverter:
    """Converter for DashScope format to AgentScope Msg format."""

    def __init__(self, default_name: str = "assistant") -> None:
        """Initialize the converter.

        Args:
            default_name: Default name for assistant messages when not specified.
        """
        self.default_name = default_name

    def convert_message(
        self,
        dashscope_msg: dict[str, Any],
        name: str | None = None,
    ) -> "Msg":
        """Convert a single DashScope format message to AgentScope Msg.

        Args:
            dashscope_msg: DashScope format message dictionary containing
                'role', 'content', and optionally 'tool_calls', 'reasoning_content',
                'tool_call_id', 'name'.
            name: Override name for the message. If None, uses the name from
                dashscope_msg or default_name.

        Returns:
            AgentScope Msg object.

        Examples:
            >>> converter = DashScopeToAgentScopeConverter()
            >>> # Plain text message
            >>> ds_msg = {"role": "assistant", "content": "Hello!"}
            >>> msg = converter.convert_message(ds_msg)
            >>> # Multimodal message with content blocks
            >>> ds_msg = {
            ...     "role": "user",
            ...     "content": [
            ...         {"text": "What's in this image?"},
            ...         {"image": "https://example.com/image.jpg"}
            ...     ]
            ... }
            >>> msg = converter.convert_message(ds_msg)
            >>> # Tool call message
            >>> ds_msg = {
            ...     "role": "assistant",
            ...     "content": "",
            ...     "tool_calls": [{
            ...         "id": "call_123",
            ...         "type": "function",
            ...         "function": {
            ...             "name": "get_weather",
            ...             "arguments": '{"city": "Beijing"}'
            ...         }
            ...     }]
            ... }
            >>> msg = converter.convert_message(ds_msg)
        """
        from agentscope.message import Msg

        role = dashscope_msg.get("role", "assistant")
        if role not in ["user", "assistant", "system"]:
            # Map 'tool' role to 'user' since tool results are inputs to assistant
            if role == "tool":
                role = "user"
            else:
                role = "assistant"

        # Determine message name
        msg_name = name or dashscope_msg.get("name") or (self.default_name if role == "assistant" else role)

        # Handle tool result messages (role="tool")
        if dashscope_msg.get("role") == "tool":
            content_blocks = self._convert_tool_result_to_blocks(dashscope_msg)
            return Msg(
                name=msg_name,
                content=content_blocks,
                role=role,
            )

        # Extract content
        raw_content = dashscope_msg.get("content", "")
        tool_calls = dashscope_msg.get("tool_calls", [])
        reasoning_content = dashscope_msg.get("reasoning_content", "")

        # Check if we need ContentBlocks or plain string
        _ = self._has_multimodal_content(raw_content)
        has_tools = len(tool_calls) > 0
        has_reasoning = bool(reasoning_content)

        # If only plain text without tools/reasoning/multimodal, use string content
        if isinstance(raw_content, str) and not has_tools and not has_reasoning:
            return Msg(
                name=msg_name,
                content=raw_content or "",
                role=role,
            )

        # Otherwise, build ContentBlock list
        content_blocks = []

        # Add reasoning content (thinking block)
        if has_reasoning:
            from agentscope.message import ThinkingBlock

            content_blocks.append(
                ThinkingBlock(
                    type="thinking",
                    thinking=reasoning_content,
                ),
            )

        # Convert content to blocks
        content_blocks.extend(self._convert_content_to_blocks(raw_content))

        # Convert tool calls to blocks
        if has_tools:
            content_blocks.extend(self._convert_tool_calls_to_blocks(tool_calls))

        # If we have no blocks but expected to have content, return empty string
        if not content_blocks:
            return Msg(
                name=msg_name,
                content="",
                role=role,
            )

        return Msg(
            name=msg_name,
            content=content_blocks,
            role=role,
        )

    def convert_messages(
        self,
        dashscope_msgs: list[dict[str, Any]],
    ) -> list["Msg"]:
        """Convert a list of DashScope format messages to AgentScope Msgs.

        Args:
            dashscope_msgs: List of DashScope format message dictionaries.

        Returns:
            List of AgentScope Msg objects.
        """
        return [self.convert_message(msg) for msg in dashscope_msgs]

    def _has_multimodal_content(self, content: Any) -> bool:
        """Check if content contains multimodal data.

        Args:
            content: Content to check (string or list of content blocks).

        Returns:
            True if content contains images, audio, or video.
        """
        if not isinstance(content, list):
            return False

        for item in content:
            if isinstance(item, dict):
                item_type = item.get("type", "")
                if item_type in ["image", "audio", "video", "image_url"]:
                    return True
                # Check for keys that indicate media
                if any(key in item for key in ["image", "audio", "video", "image_url"]):
                    return True

        return False

    def _convert_content_to_blocks(
        self,
        content: str | list[dict[str, Any]],
    ) -> list[Any]:
        """Convert DashScope content to AgentScope content blocks.

        Args:
            content: DashScope content (string or list of content items).

        Returns:
            List of AgentScope content blocks.
        """
        from agentscope.message import (
            AudioBlock,
            ImageBlock,
            TextBlock,
            URLSource,
            VideoBlock,
        )

        blocks = []

        if isinstance(content, str):
            if content:
                blocks.append(
                    TextBlock(
                        type="text",
                        text=content,
                    ),
                )
        elif isinstance(content, list):
            for item in content:
                if not isinstance(item, dict):
                    continue

                # Handle text blocks
                if "text" in item:
                    text = item["text"]
                    if text:
                        blocks.append(
                            TextBlock(
                                type="text",
                                text=text,
                            ),
                        )

                # Handle image blocks
                elif "image" in item or item.get("type") == "image":
                    url = item.get("image", "")
                    blocks.append(
                        ImageBlock(
                            type="image",
                            source=URLSource(
                                type="url",
                                url=url,
                            ),
                        ),
                    )

                # Handle image_url format (OpenAI style)
                elif "image_url" in item or item.get("type") == "image_url":
                    image_url = item.get("image_url", {})
                    if isinstance(image_url, dict):
                        url = image_url.get("url", "")
                    else:
                        url = str(image_url)

                    blocks.append(
                        ImageBlock(
                            type="image",
                            source=URLSource(
                                type="url",
                                url=url,
                            ),
                        ),
                    )

                # Handle audio blocks
                elif "audio" in item or item.get("type") == "audio":
                    url = item.get("audio", "")
                    blocks.append(
                        AudioBlock(
                            type="audio",
                            source=URLSource(
                                type="url",
                                url=url,
                            ),
                        ),
                    )

                # Handle video blocks
                elif "video" in item or item.get("type") == "video":
                    video_data = item.get("video", "")
                    # Video can be a URL string or list of frame URLs
                    if isinstance(video_data, list):
                        # Use first frame as URL for now
                        url = video_data[0] if video_data else ""
                    else:
                        url = str(video_data)

                    blocks.append(
                        VideoBlock(
                            type="video",
                            source=URLSource(
                                type="url",
                                url=url,
                            ),
                        ),
                    )

        return blocks

    def _convert_tool_calls_to_blocks(
        self,
        tool_calls: list[dict[str, Any]],
    ) -> list[Any]:
        """Convert DashScope tool_calls to AgentScope ToolUseBlocks.

        Args:
            tool_calls: List of DashScope tool call dictionaries.

        Returns:
            List of AgentScope ToolUseBlock objects.
        """
        from agentscope.message import ToolUseBlock

        blocks = []

        for tool_call in tool_calls:
            tool_id = tool_call.get("id", "")
            function = tool_call.get("function", {})
            name = function.get("name", "")
            arguments_str = function.get("arguments", "{}")

            # Parse arguments JSON string to dict
            try:
                arguments = json.loads(arguments_str)
            except (json.JSONDecodeError, TypeError):
                arguments = {}

            blocks.append(
                ToolUseBlock(
                    type="tool_use",
                    id=tool_id,
                    name=name,
                    input=arguments,
                ),
            )

        return blocks

    def _convert_tool_result_to_blocks(
        self,
        dashscope_msg: dict[str, Any],
    ) -> list[Any]:
        """Convert DashScope tool result message to AgentScope ToolResultBlock.

        Args:
            dashscope_msg: DashScope tool result message with role="tool".

        Returns:
            List containing a single ToolResultBlock.
        """
        from agentscope.message import ToolResultBlock

        tool_call_id = dashscope_msg.get("tool_call_id", "")
        content = dashscope_msg.get("content", "")
        name = dashscope_msg.get("name", "")

        # Tool result content should be plain text
        return [
            ToolResultBlock(
                type="tool_result",
                id=tool_call_id,
                name=name,
                output=content if content else "",
            ),
        ]


def convert_dashscope_to_agentscope(
    dashscope_msg: dict[str, Any] | list[dict[str, Any]],
    name: str | None = None,
    default_name: str = "assistant",
) -> "Msg | list[Msg]":
    """Convenience function to convert DashScope format to AgentScope Msg.

    Args:
        dashscope_msg: Single message dict or list of message dicts in DashScope format.
        name: Override name for the message(s).
        default_name: Default name for assistant messages.

    Returns:
        Single Msg object or list of Msg objects.

    Examples:
        >>> # Single message
        >>> msg = convert_dashscope_to_agentscope({"role": "assistant", "content": "Hi"})
        >>> # Multiple messages
        >>> msgs = convert_dashscope_to_agentscope([
        ...     {"role": "user", "content": "Hello"},
        ...     {"role": "assistant", "content": "Hi there!"}
        ... ])
    """
    converter = DashScopeToAgentScopeConverter(default_name=default_name)

    if isinstance(dashscope_msg, list):
        return converter.convert_messages(dashscope_msg)
    else:
        return converter.convert_message(dashscope_msg, name=name)
