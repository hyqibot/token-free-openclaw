"""Memory merging operation module.

This module provides functionality to merge multiple retrieved memories
into a single formatted context string for use in LLM responses.
"""

from typing import List

from flowllm.core.context import C
from flowllm.core.op import BaseAsyncOp
from loguru import logger

from reme_ai.schema.memory import BaseMemory


@C.register_op()
class MergeMemoryOp(BaseAsyncOp):
    """Merge multiple memories into a single formatted context.

    This operation takes a list of retrieved memories and formats them into
    a single context string that can be used to guide LLM responses. It includes
    instructions for the LLM to consider the helpful parts from these memories.
    """

    async def async_execute(self):
        """Execute the memory merging operation.

        Merges memories from context metadata into a formatted string with
        instructions for the LLM. Stores the merged result in response.answer.
        """
        memory_list: List[BaseMemory] = self.context.response.metadata["memory_list"]

        if not memory_list:
            return

        content_collector = ["Previous Memory"]
        for memory in memory_list:
            if not memory.content:
                continue

            content_collector.append(f"- {memory.when_to_use} {memory.content}\n")
        content_collector.append(
            "Please consider the helpful parts from these in answering the question, "
            "to make the response more comprehensive and substantial.",
        )
        self.context.response.answer = "\n".join(content_collector)
        logger.info(f"response.answer={self.context.response.answer}")
