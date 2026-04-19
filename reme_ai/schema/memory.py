"""Memory schema definitions for ReMe.

This module defines the core memory data structures used in the ReMe system,
including base memory classes and specialized memory types for tasks, personal
information, and tool call results.
"""

import datetime
import hashlib
import json
from abc import ABC
from typing import List
from uuid import uuid4

from flowllm.core.schema import VectorNode
from mcp.types import CallToolResult, TextContent
from pydantic import BaseModel, Field


class BaseMemory(BaseModel, ABC):
    """Base class for all memory types in the ReMe system.

    This abstract base class provides common fields and methods for all memory
    types, including workspace identification, content storage, timestamps,
    and conversion to/from vector nodes for storage and retrieval.

    Attributes:
        workspace_id: Identifier for the workspace this memory belongs to.
        memory_id: Unique identifier for this memory instance.
        memory_type: Type of memory (task, personal, tool, etc.).
        when_to_use: Description of when this memory should be retrieved.
        content: The actual content of the memory (string or bytes).
        score: Relevance score for this memory (0.0 to 1.0).
        time_created: Timestamp when the memory was created.
        time_modified: Timestamp when the memory was last modified.
        author: Identifier of the entity that created this memory.
        metadata: Additional metadata dictionary for extensibility.
    """

    workspace_id: str = Field(default="")
    memory_id: str = Field(default_factory=lambda: uuid4().hex)
    memory_type: str = Field(default=...)

    when_to_use: str = Field(default="")
    content: str | bytes = Field(default="")
    score: float = Field(default=0)

    time_created: str = Field(default_factory=lambda: datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    time_modified: str = Field(default_factory=lambda: datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    author: str = Field(default="")

    metadata: dict = Field(default_factory=dict)

    def update_modified_time(self):
        """Update the time_modified field to the current timestamp."""
        self.time_modified = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def update_metadata(self, new_metadata):
        """Update the metadata dictionary with new values.

        Args:
            new_metadata: Dictionary containing new metadata to replace existing metadata.
        """
        self.metadata = new_metadata

    def to_vector_node(self) -> VectorNode:
        """Convert this memory instance to a VectorNode for storage.

        Returns:
            VectorNode: A vector node representation of this memory.

        Raises:
            NotImplementedError: Must be implemented by subclasses.
        """
        raise NotImplementedError

    @classmethod
    def from_vector_node(cls, node: VectorNode):
        """Create a memory instance from a VectorNode.

        Args:
            node: VectorNode containing memory data.

        Returns:
            BaseMemory: A memory instance reconstructed from the vector node.

        Raises:
            NotImplementedError: Must be implemented by subclasses.
        """
        raise NotImplementedError


class TaskMemory(BaseMemory):
    """Memory type for storing task-related information.

    TaskMemory is used to store information about tasks, including when to use
    the memory and the task content itself. It extends BaseMemory with
    task-specific behavior.

    Attributes:
        memory_type: Always set to "task" for task memories.
    """

    memory_type: str = Field(default="task")

    def to_vector_node(self) -> VectorNode:
        """Convert this TaskMemory to a VectorNode.

        Returns:
            VectorNode: Vector node representation with when_to_use as content
                and all other fields stored in metadata.
        """
        return VectorNode(
            unique_id=self.memory_id,
            workspace_id=self.workspace_id,
            content=self.when_to_use,
            metadata={
                "memory_type": self.memory_type,
                "content": self.content,
                "score": self.score,
                "time_created": self.time_created,
                "time_modified": self.time_modified,
                "author": self.author,
                "metadata": json.dumps(self.metadata, ensure_ascii=False),
            },
        )

    @classmethod
    def from_vector_node(cls, node: VectorNode) -> "TaskMemory":
        """Create a TaskMemory instance from a VectorNode.

        Args:
            node: VectorNode containing task memory data.

        Returns:
            TaskMemory: Reconstructed TaskMemory instance.
        """
        metadata = node.metadata.copy()
        memory_metadata = metadata.pop("metadata", {})
        if isinstance(memory_metadata, str):
            memory_metadata = json.loads(memory_metadata)

        return cls(
            workspace_id=node.workspace_id,
            memory_id=node.unique_id,
            memory_type=metadata.pop("memory_type"),
            when_to_use=node.content,
            content=metadata.pop("content"),
            score=metadata.pop("score"),
            time_created=metadata.pop("time_created"),
            time_modified=metadata.pop("time_modified"),
            author=metadata.pop("author"),
            metadata=memory_metadata,
        )


class PersonalMemory(BaseMemory):
    """Memory type for storing personal information and user preferences.

    PersonalMemory extends BaseMemory with fields specific to personal data,
    including target information and reflection subject attributes. This is
    used for storing user preferences, personal insights, and reflection data.

    Attributes:
        memory_type: Always set to "personal" for personal memories.
        target: Target identifier or category for this personal memory.
        reflection_subject: Subject of reflection for storing reflection attributes.
    """

    memory_type: str = Field(default="personal")
    target: str = Field(default="")
    reflection_subject: str = Field(default="")  # For storing reflection subject attributes

    def to_vector_node(self) -> VectorNode:
        """Convert this PersonalMemory to a VectorNode.

        Returns:
            VectorNode: Vector node representation with when_to_use as content
                and all other fields including target and reflection_subject
                stored in metadata.
        """
        return VectorNode(
            unique_id=self.memory_id,
            workspace_id=self.workspace_id,
            content=self.when_to_use,
            metadata={
                "memory_type": self.memory_type,
                "content": self.content,
                "target": self.target,
                "reflection_subject": self.reflection_subject,
                "score": self.score,
                "time_created": self.time_created,
                "time_modified": self.time_modified,
                "author": self.author,
                "metadata": json.dumps(self.metadata, ensure_ascii=False),
            },
        )

    @classmethod
    def from_vector_node(cls, node: VectorNode) -> "PersonalMemory":
        """Create a PersonalMemory instance from a VectorNode.

        Args:
            node: VectorNode containing personal memory data.

        Returns:
            PersonalMemory: Reconstructed PersonalMemory instance.
        """
        metadata = node.metadata.copy()
        memory_metadata = metadata.pop("metadata", {})
        if isinstance(memory_metadata, str):
            memory_metadata = json.loads(memory_metadata)

        return cls(
            workspace_id=node.workspace_id,
            memory_id=node.unique_id,
            memory_type=metadata.pop("memory_type"),
            when_to_use=node.content,
            content=metadata.pop("content"),
            target=metadata.pop("target", ""),
            reflection_subject=metadata.pop("reflection_subject", ""),
            score=metadata.pop("score"),
            time_created=metadata.pop("time_created"),
            time_modified=metadata.pop("time_modified"),
            author=metadata.pop("author"),
            metadata=memory_metadata,
        )


class ToolCallResult(BaseModel):
    """Represents the result of a tool invocation.

    This class stores comprehensive information about a tool call, including
    inputs, outputs, performance metrics, evaluation, and deduplication hash.

    Attributes:
        create_time: Timestamp when the tool was invoked.
        tool_name: Name of the tool that was called.
        input: Input parameters passed to the tool (dict or string).
        output: Output result from the tool execution.
        token_cost: Number of tokens consumed by the tool call (-1 if unknown).
        success: Whether the tool invocation completed successfully.
        time_cost: Time taken for the tool invocation in seconds.
        summary: Brief summary of the tool call result.
        evaluation: Detailed evaluation of the tool invocation.
        score: Quality score from 0.0 (failure) to 1.0 (complete success).
        is_summarized: Whether this tool call has been included in a summary.
        call_hash: MD5 hash of input and output for deduplication.
        metadata: Additional metadata dictionary.
    """

    create_time: str = Field(default="", description="Time of tool invocation")
    tool_name: str = Field(default=..., description="Name of the tool")
    input: dict | str = Field(default="", description="Tool input")
    output: str = Field(default="", description="Tool output")
    token_cost: int = Field(default=-1, description="Token consumption of the tool")
    success: bool = Field(default=True, description="Whether the tool invocation was successful")
    time_cost: float = Field(default=0, description="Time consumed by the tool invocation, in seconds")
    summary: str = Field(default="", description="Brief summary of the tool call result")
    evaluation: str = Field(default="", description="Detailed evaluation for the tool invocation")
    score: float = Field(default=0, description="Score of the Evaluation (0.0 for failure, 1.0 for complete success)")
    is_summarized: bool = Field(default=False, description="Whether this tool call has been included in a summary")
    call_hash: str = Field(default="", description="Hash value of input and output combined for deduplication")

    metadata: dict = Field(default_factory=dict)

    def generate_hash(self) -> str:
        """Generate hash value from tool input and output for deduplication.

        Creates an MD5 hash from the combined input and output strings.
        This hash is used to identify duplicate tool calls.

        Returns:
            str: MD5 hash hexdigest of the combined input and output.
        """
        # Convert input to string if it's a dict
        input_str = json.dumps(self.input, sort_keys=True) if isinstance(self.input, dict) else str(self.input)

        # Combine input and output
        combined = f"{input_str}|{self.output}"

        # Generate MD5 hash
        hash_value = hashlib.md5(combined.encode("utf-8")).hexdigest()

        return hash_value

    def ensure_hash(self):
        """Ensure call_hash is set, generate if empty."""
        if not self.call_hash:
            self.call_hash = self.generate_hash()

    def from_mcp_tool_result(self, tool_result: CallToolResult, max_char_len: int = None):
        """Populate this instance from an MCP CallToolResult.

        Args:
            tool_result: MCP CallToolResult to extract data from.
            max_char_len: Optional maximum character length for output content.
                If provided, output will be truncated to this length.
        """
        text_list = []
        for content in tool_result.content:
            if isinstance(content, TextContent):
                text_list.append(content.text)

            else:
                raise NotImplementedError(f"content.type={type(content)} not supported")
        content = "\n".join(text_list)

        if max_char_len:
            content = content[:max_char_len]
        self.output = content

        self.success = not tool_result.is_error
        self.metadata.update(tool_result.meta)


class ToolMemory(BaseMemory):
    """Memory type for storing tool call execution history.

    ToolMemory extends BaseMemory to store a collection of tool call results,
    allowing tracking of tool usage patterns, performance metrics, and
    execution history for analysis and summarization.

    Attributes:
        memory_type: Always set to "tool" for tool memories.
        tool_call_results: List of ToolCallResult instances representing
            historical tool invocations.
    """

    memory_type: str = Field(default="tool")
    tool_call_results: List[ToolCallResult] = Field(default_factory=list)

    def to_vector_node(self) -> VectorNode:
        """Convert this ToolMemory to a VectorNode.

        Returns:
            VectorNode: Vector node representation with when_to_use as content
                and all tool_call_results serialized in metadata.
        """
        return VectorNode(
            unique_id=self.memory_id,
            workspace_id=self.workspace_id,
            content=self.when_to_use,
            metadata={
                "memory_type": self.memory_type,
                "content": self.content,
                "score": self.score,
                "time_created": self.time_created,
                "time_modified": self.time_modified,
                "author": self.author,
                "tool_call_results": [x.model_dump() for x in self.tool_call_results],
                "metadata": json.dumps(self.metadata, ensure_ascii=False),
            },
        )

    def statistic(self, recent_frequency: int = 20) -> dict:
        """Calculate statistical information for the most recent N tool calls.

        Analyzes the most recent tool calls and computes average metrics including
        token cost, success rate, time cost, and quality scores.

        Args:
            recent_frequency: Number of most recent tool calls to analyze.
                Defaults to 20.

        Returns:
            dict: Dictionary containing:
                - avg_token_cost: Average token consumption (rounded to 2 decimals)
                - avg_time_cost: Average execution time in seconds (rounded to 3 decimals)
                - success_rate: Ratio of successful calls (rounded to 4 decimals)
                - avg_score: Average quality score (rounded to 3 decimals)
        """
        if not self.tool_call_results:
            return {
                "total_calls": 0,
                "recent_calls_analyzed": 0,
                "avg_token_cost": 0.0,
                "success_rate": 0.0,
                "avg_time_cost": 0.0,
                "avg_score": 0.0,
            }

        # Get the most recent N tool calls (or all if less than N)
        recent_calls = self.tool_call_results[-recent_frequency:]
        # total_calls = len(self.tool_call_results)
        recent_calls_count = len(recent_calls)

        # Calculate statistics
        total_token_cost = sum(call.token_cost for call in recent_calls if call.token_cost >= 0)
        valid_token_calls = [call for call in recent_calls if call.token_cost >= 0]
        avg_token_cost = total_token_cost / len(valid_token_calls) if valid_token_calls else 0.0

        successful_calls = sum(1 for call in recent_calls if call.success)
        success_rate = successful_calls / recent_calls_count if recent_calls_count > 0 else 0.0

        total_time_cost = sum(call.time_cost for call in recent_calls)
        avg_time_cost = total_time_cost / recent_calls_count if recent_calls_count > 0 else 0.0

        total_score = sum(call.score for call in recent_calls)
        avg_score = total_score / recent_calls_count if recent_calls_count > 0 else 0.0

        return {
            "avg_token_cost": round(avg_token_cost, 2),
            "avg_time_cost": round(avg_time_cost, 3),
            "success_rate": round(success_rate, 4),
            "avg_score": round(avg_score, 3),
        }

    @classmethod
    def from_vector_node(cls, node: VectorNode) -> "ToolMemory":
        """Create a ToolMemory instance from a VectorNode.

        Args:
            node: VectorNode containing tool memory data.

        Returns:
            ToolMemory: Reconstructed ToolMemory instance with tool_call_results
                deserialized from metadata.
        """
        metadata = node.metadata.copy()
        tool_call_results = [ToolCallResult(**result) for result in metadata.pop("tool_call_results", [])]
        memory_metadata = metadata.pop("metadata", {})
        if isinstance(memory_metadata, str):
            memory_metadata = json.loads(memory_metadata)

        return cls(
            workspace_id=node.workspace_id,
            memory_id=node.unique_id,
            when_to_use=node.content,
            memory_type=metadata.pop("memory_type"),
            content=metadata.pop("content"),
            score=metadata.pop("score"),
            time_created=metadata.pop("time_created"),
            time_modified=metadata.pop("time_modified"),
            author=metadata.pop("author"),
            tool_call_results=tool_call_results,
            metadata=memory_metadata,
        )


def vector_node_to_memory(node: VectorNode):
    """Convert a VectorNode to the appropriate memory type.

    This function inspects the memory_type in the node's metadata and
    reconstructs the appropriate memory subclass (TaskMemory, PersonalMemory,
    or ToolMemory).

    Args:
        node: VectorNode containing memory data with memory_type in metadata.

    Returns:
        BaseMemory: Instance of the appropriate memory subclass based on
            memory_type.

    Raises:
        RuntimeError: If memory_type is not recognized or not present.
    """
    memory_type = node.metadata.get("memory_type")
    if memory_type == "task":
        return TaskMemory.from_vector_node(node)

    elif memory_type == "personal":
        return PersonalMemory.from_vector_node(node)

    elif memory_type == "tool":
        return ToolMemory.from_vector_node(node)

    else:
        raise RuntimeError(f"memory_type={memory_type} not supported!")


def dict_to_memory(memory_dict: dict):
    """Create a memory instance from a dictionary.

    This function creates the appropriate memory subclass based on the
    memory_type field in the dictionary. Defaults to TaskMemory if
    memory_type is not specified.

    Args:
        memory_dict: Dictionary containing memory data with optional
            memory_type field.

    Returns:
        BaseMemory: Instance of the appropriate memory subclass based on
            memory_type.

    Raises:
        RuntimeError: If memory_type is not recognized.
    """
    memory_type = memory_dict.get("memory_type", "task")
    if memory_type == "task":
        return TaskMemory(**memory_dict)

    elif memory_type == "personal":
        return PersonalMemory(**memory_dict)

    elif memory_type == "tool":
        return ToolMemory(**memory_dict)

    else:
        raise RuntimeError(f"memory_type={memory_type} not supported!")


def task_main():
    """Test function for TaskMemory serialization and deserialization."""
    e1 = TaskMemory(
        workspace_id="w_1024",
        memory_id="123",
        when_to_use="test case use",
        content="test content",
        score=0.99,
        metadata={},
    )
    print(e1.model_dump_json(indent=2))
    v1 = e1.to_vector_node()
    print(v1.model_dump_json(indent=2))
    e2 = vector_node_to_memory(v1)
    print(e2.model_dump_json(indent=2))


def personal_main():
    """Test function for PersonalMemory serialization and deserialization."""
    p1 = PersonalMemory(
        workspace_id="w_2048",
        memory_id="456",
        when_to_use="personal memory test case",
        content="personal test content",
        target="user_preferences",
        reflection_subject="learning_style",
        score=0.85,
        metadata={"category": "user_profile"},
    )
    print("PersonalMemory test:")
    print(p1.model_dump_json(indent=2))
    v1 = p1.to_vector_node()
    print("VectorNode:")
    print(v1.model_dump_json(indent=2))
    p2 = vector_node_to_memory(v1)
    print("Reconstructed PersonalMemory:")
    print(p2.model_dump_json(indent=2))


def tool_main():
    """Test function for ToolMemory serialization and deserialization."""
    # Create sample tool call results
    tool_result1 = ToolCallResult(
        create_time="2025-10-15 10:30:00",
        tool_name="file_reader",
        input={"file_path": "/test/file.txt"},
        output="File content successfully read",
        token_cost=50,
        success=True,
        time_cost=0.5,
        evaluation="Successfully executed",
        score=0.95,
    )

    tool_result2 = ToolCallResult(
        create_time="2025-10-15 10:31:00",
        tool_name="data_processor",
        input={"data": "sample_data", "format": "json"},
        output="Data processed successfully",
        token_cost=75,
        success=True,
        time_cost=1.2,
        evaluation="Good performance",
        score=0.88,
    )

    t1 = ToolMemory(
        workspace_id="w_4096",
        memory_id="789",
        memory_type="tool",
        when_to_use="tool execution memory test",
        content="tool execution test content",
        score=0.92,
        tool_call_results=[tool_result1, tool_result2],
        metadata={"execution_context": "test_environment"},
    )

    print("ToolMemory test:")
    print(t1.model_dump_json(indent=2))
    v1 = t1.to_vector_node()
    print("VectorNode:")
    print(v1.model_dump_json(indent=2))
    t2 = ToolMemory.from_vector_node(v1)
    print("Reconstructed ToolMemory:")
    print(t2.model_dump_json(indent=2))


if __name__ == "__main__":
    print("=== Task Memory Test ===")
    # task_main()
    print("\n=== Personal Memory Test ===")
    # personal_main()
    print("\n=== Tool Memory Test ===")
    tool_main()
