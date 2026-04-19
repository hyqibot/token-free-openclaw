"""Operation for updating memory frequency counters."""

from typing import List

from flowllm.core.context import C
from flowllm.core.op import BaseAsyncOp
from loguru import logger

from reme_ai.schema.memory import BaseMemory, dict_to_memory


@C.register_op()
class UpdateMemoryFreqOp(BaseAsyncOp):
    """Operation that increments the frequency counter for memories.

    This operation updates the frequency metadata for memories that have been
    recalled or used. Each memory's frequency is incremented by 1, and the
    memory IDs are marked for deletion (to be replaced with updated versions).

    Attributes:
        file_path: Path to the file containing this operation.
    """

    file_path: str = __file__

    async def async_execute(self):
        """Execute the memory frequency update operation.

        Processes memory dictionaries from context, converts them to BaseMemory
        objects, increments their frequency counters, and prepares them for
        vector store update. The original memory IDs are marked for deletion
        so they can be replaced with updated versions.

        Expected context attributes:
            memory_dicts: List of memory dictionaries to update.

        Sets context attributes:
            deleted_memory_ids: List of memory IDs to delete (for replacement).
            memory_list: List of updated BaseMemory objects with incremented frequency.
        """
        memory_dicts: List[dict] = self.context.memory_dicts

        if not memory_dicts:
            logger.info("No memories to update freq")
            return

        memory_list: List[BaseMemory] = [dict_to_memory(memory_dict) for memory_dict in memory_dicts]
        new_memory_list = []
        deleted_memory_ids = []
        for memory in memory_list:
            # Update freq from metadata
            metadata = memory.metadata
            metadata["freq"] = metadata.get("freq", 0) + 1
            memory.update_metadata(metadata)

            deleted_memory_ids.append(memory.memory_id)
            new_memory_list.append(memory)

        self.context.deleted_memory_ids = deleted_memory_ids
        self.context.memory_list = new_memory_list
