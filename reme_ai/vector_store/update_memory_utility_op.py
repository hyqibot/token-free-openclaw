"""Operation for updating memory utility scores."""

from typing import List

from flowllm.core.context import C
from flowllm.core.op import BaseAsyncOp
from loguru import logger

from reme_ai.schema.memory import BaseMemory


@C.register_op()
class UpdateMemoryUtilityOp(BaseAsyncOp):
    """Operation that increments the utility score for memories.

    This operation updates the utility metadata for memories that have been
    deemed useful (e.g., contributed positively to a task). Each memory's
    utility score is incremented by 1.

    Attributes:
        file_path: Path to the file containing this operation.
    """

    file_path: str = __file__

    async def async_execute(self):
        """Execute the memory utility update operation.

        Processes memories from context and increments their utility scores.
        This operation only runs if update_utility flag is set and memory_dicts
        are provided. The updated memories are stored in response metadata
        along with deleted memory IDs for vector store synchronization.

        Expected context attributes:
            memory_dicts: List of memory dictionaries to update.
            update_utility: Boolean flag indicating whether to update utility.
            memory_list: List of BaseMemory objects to update.
            deleted_memory_ids: List of memory IDs marked for deletion.

        Sets context attributes:
            response.metadata["memory_list"]: List of updated BaseMemory objects.
            response.metadata["deleted_memory_ids"]: List of memory IDs to delete.
        """
        memory_dicts: List[dict] = self.context.memory_dicts
        update_utility = self.context.update_utility

        if not memory_dicts:
            logger.info("No memories to update utility")
            return

        if not update_utility:
            self.context.response.metadata["memory_list"] = self.context.memory_list
            self.context.response.metadata["deleted_memory_ids"] = self.context.deleted_memory_ids
            logger.info("No memories to update utility")
            return

        memory_list: List[BaseMemory] = self.context.memory_list
        new_memory_list = []
        for memory in memory_list:
            # Update utility from metadata
            metadata = memory.metadata
            metadata["utility"] = metadata.get("utility", 0) + 1
            memory.update_metadata(metadata)

            new_memory_list.append(memory)

        self.context.response.metadata["memory_list"] = new_memory_list
        self.context.response.metadata["deleted_memory_ids"] = self.context.deleted_memory_ids
