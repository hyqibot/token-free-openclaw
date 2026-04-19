"""Schema module for ReMe.

This module provides data structures and schemas for memory management,
including memory types, tool call results, and conversion utilities.
"""

from flowllm.core.enumeration import Role  # noqa
from flowllm.core.schema import Message, Trajectory  # noqa

from reme_ai.schema.memory import (
    BaseMemory,
    PersonalMemory,
    TaskMemory,
    ToolCallResult,
    ToolMemory,
    dict_to_memory,
    vector_node_to_memory,
)

__all__ = [
    # FlowLLM schema imports
    "Message",
    "Role",
    "Trajectory",
    # Memory classes
    "BaseMemory",
    "TaskMemory",
    "PersonalMemory",
    "ToolMemory",
    "ToolCallResult",
    # Utility functions
    "vector_node_to_memory",
    "dict_to_memory",
]
