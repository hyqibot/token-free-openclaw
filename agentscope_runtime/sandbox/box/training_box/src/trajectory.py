# -*- coding: utf-8 -*-
# pylint: disable=no-member
"""
Module for defining data structures and models used in trajectory tracking.

This module provides classes and enums for managing messages, tool calls,
roles, rewards, and trajectory information in an agent-based system.
"""
import datetime
import json
from typing import List, Any
from uuid import uuid4
from enum import Enum
from pydantic import BaseModel, Field  # , model_validator


class Reward(BaseModel):
    """
    Represents a reward with an optional value and metadata.

    Attributes:
        reward_value (float, optional): The numerical reward value.
        metadata (dict): Additional information about the reward.
    """

    reward_value: float | None = Field(default=None)
    metadata: dict = Field(default_factory=dict)


class Role(str, Enum):
    """
    Enumeration of possible roles in the agent communication system.

    Defines standard roles for system, user, tool,
        and different types of assistants.
    """

    SYSTEM = "system"
    USER = "user"
    TOOL = "tool"  # environment
    ASSISTANT = "assistant"  # policy model
    CONTEXT_ASSISTANT = "context_assistant"  # context model
    SUMMARY_ASSISTANT = "summary_assistant"  # summary model


class ToolCall(BaseModel):
    """
    Represents a tool call with its associated metadata and properties.

    Attributes:
        index (int): The index of the tool call.
        id (str): Unique identifier for the tool call.
        name (str): Name of the tool being called.
        arguments (str): Arguments for the tool call.
        type (str): Type of the tool call.
        result (Any, optional): Result of the tool call.
    """

    index: int = Field(default=...)
    id: str = Field(default="")
    name: str = Field(default="")
    arguments: str = Field(default="")
    type: str = Field(default="function")
    result: Any = Field(default=None, exclude=True)

    # @model_validator(mode="before")  # noqa
    @classmethod
    def init_tool_call(cls, data: dict):
        """
        Initialize tool call data, ensuring required fields are present.

        Args:
            data (dict): Input data for tool call.

        Returns:
            dict: Processed tool call data.
        """
        tool_type = data.get("type", "")
        tool_type_dict = data.get(tool_type, {})

        for key in ["name", "arguments"]:
            if key not in data:
                data[key] = tool_type_dict.get(key, "")
        return data

    @property
    def argument_dict(self):
        """
        Convert arguments string to a dictionary.

        Returns:
            dict: Parsed arguments.
        """
        return json.loads(self.arguments)

    @property
    def simple_dict(self):
        """
        Create a simplified dictionary representation of the tool call.

        Returns:
            dict: Simplified tool call information.
        """
        return {
            "id": self.id,
            self.type: {"arguments": self.arguments, "name": self.name},
            "type": self.type,
            "index": self.index,
            "result": self.result,
        }


class Message(BaseModel):
    """
    Represents a message in the communication system.

    Attributes:
        role (Role): The role of the message sender.
        content (str or bytes): The message content.
        reasoning_content (str):
            Additional reasoning content.
        tool_calls (List[ToolCall]):
            List of tool calls associated with the message.
        timestamp (str): Timestamp of message creation.
        metadata (dict): Additional metadata for the message.
    """

    role: Role = Field(default=Role.USER)
    content: str | bytes = Field(default="")
    reasoning_content: str = Field(default="")
    tool_calls: List[ToolCall] = Field(default_factory=list)
    timestamp: str = Field(
        default_factory=lambda: datetime.datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S.%f",
        ),
    )
    metadata: dict = Field(default_factory=dict)

    @property
    def simple_dict(self) -> dict:
        """
        Create a simplified dictionary representation of the message.

        Returns:
            dict: Simplified message information.
        """
        result = {
            "role": self.role.value,
            "content": self.content,
        }
        if self.tool_calls:
            result["tool_calls"] = [x.simple_dict for x in self.tool_calls]
        return result


class ActionMessage(Message):
    """
    Represents an action message with a predefined role of ASSISTANT.
    """

    role: Role = Field(default=Role.ASSISTANT)


class StateMessage(Message):
    """
    Represents a state message with additional tool call tracking.

    Attributes:
        tool_call_id (str): Identifier for the associated tool call.
    """

    role: Role = Field(default=Role.USER)
    tool_call_id: str = Field(default="")

    @property
    def simple_dict(self) -> dict:
        """
        Create a simplified dictionary representation of the state message.

        Returns:
            dict: Simplified state message information.
        """
        result = {
            "role": self.role.value,
            "content": self.content,
            "tool_calls": [tc.simple_dict for tc in self.tool_calls],
        }
        if self.tool_call_id:
            result["tool_call_id"] = self.tool_call_id
        return result

    @property
    def simple_list(self) -> list:
        """
        Create a simplified list representation of the state message.

        Returns:
            list: Simplified list of state message information.
        """
        return [
            {
                "role": self.role.value,
                "content": str(x.result),
                "tool_call_id": x.id,
            }
            for x in self.tool_calls
        ]


class ContextMessage(Message):
    """
    Represents a context message with a predefined role of CONTEXT_ASSISTANT.
    """

    role: Role = Field(default=Role.CONTEXT_ASSISTANT)


class SummaryMessage(Message):
    """
    Represents a summary message with a predefined role of SUMMARY_ASSISTANT.
    """

    role: Role = Field(default=Role.SUMMARY_ASSISTANT)


class Sample(BaseModel):
    """
    Represents a sample with a list of messages and associated metadata.

    Attributes:
        steps (List[Message]): List of messages in the sample.
        metadata (dict): Additional metadata for the sample.
    """

    steps: List[Message] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


class Trajectory(BaseModel):
    """
    Represents a trajectory of steps with associated metadata.

    Attributes:
        id (str): Unique identifier for the trajectory.
        steps (List[Message]): List of messages/steps in the trajectory.
        done (bool): Flag indicating if the trajectory is complete.
        query (str): Query associated with the trajectory.
        answer (Any): Answer to the query.
        metadata (dict): Additional metadata for the trajectory.
    """

    id: str = Field(default_factory=lambda: uuid4().hex)
    steps: List[Message] = Field(default_factory=list)
    done: bool = Field(default=False)
    query: str = Field(default="")
    answer: Any = Field(default=None)
    metadata: dict = Field(default_factory=dict)

    def add_step(self, step: Message):
        """
        Add a step (message) to the trajectory.

        Args:
            step (Message): Message to be added to the trajectory.
        """
        self.steps.append(step)

    def reset(self):
        """
        Reset the trajectory to its initial state.

        Clears steps, resets flags, and clears metadata.
        """
        self.steps.clear()
        self.done = False
        self.query = ""
        self.answer = ""
        self.metadata.clear()
