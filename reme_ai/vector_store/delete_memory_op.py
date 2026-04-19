"""Operation for deleting memories based on frequency and utility thresholds."""

from typing import Iterable

from flowllm.core.context import C
from flowllm.core.op import BaseAsyncOp
from flowllm.core.schema import VectorNode


@C.register_op()
class DeleteMemoryOp(BaseAsyncOp):
    """Operation that identifies and marks memories for deletion.

    This operation scans all memories in a workspace and identifies those that
    should be deleted based on frequency and utility thresholds. Memories with
    frequency >= freq_threshold and utility/frequency ratio < utility_threshold
    are marked for deletion.

    Attributes:
        file_path: Path to the file containing this operation.
    """

    file_path: str = __file__

    async def async_execute(self):
        """Execute the memory deletion operation.

        Iterates through all memories in the workspace and identifies memories
        that meet the deletion criteria. The deleted memory IDs are stored in
        context.deleted_memory_ids for subsequent processing.

        The deletion criteria:
        - Memory frequency must be >= freq_threshold
        - Memory utility/frequency ratio must be < utility_threshold

        Expected context attributes:
            workspace_id: The workspace ID to process memories for.
            freq_threshold: Minimum frequency threshold for consideration.
            utility_threshold: Maximum utility/frequency ratio threshold.

        Sets context attributes:
            deleted_memory_ids: List of memory IDs marked for deletion.
        """
        workspace_id: str = self.context.workspace_id
        freq_threshold: int = self.context.freq_threshold
        utility_threshold: float = self.context.utility_threshold
        nodes: Iterable[VectorNode] = await self.vector_store.async_list_workspace_nodes(workspace_id=workspace_id)

        deleted_memory_ids = []
        for node in nodes:
            freq = node.metadata.get("freq", 0)
            utility = node.metadata.get("utility", 0)
            if freq >= freq_threshold:
                if utility * 1.0 / freq < utility_threshold:
                    deleted_memory_ids.append(node.unique_id)

        self.context.deleted_memory_ids = deleted_memory_ids
