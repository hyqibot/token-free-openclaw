"""Operation for updating the vector store with memory changes."""

import json
from typing import List

from flowllm.core.context import C
from flowllm.core.op import BaseAsyncOp
from flowllm.core.schema import VectorNode
from loguru import logger

from reme_ai.schema.memory import BaseMemory


@C.register_op()
class UpdateVectorStoreOp(BaseAsyncOp):
    """Operation that synchronizes memory changes with the vector store.

    This operation performs the actual database operations: deleting old
    memories and inserting new/updated ones. It reads the lists of memories
    to delete and insert from the context response metadata.
    """

    async def async_execute(self):
        """Execute the vector store update operation.

        Performs batch operations on the vector store:
        1. Deletes memories specified in deleted_memory_ids
        2. Inserts new or updated memories from memory_list

        The operation reads from response.metadata and performs the actual
        database operations. Results are stored back in response.metadata.

        Expected context attributes:
            workspace_id: The workspace ID to update.

        Expected response.metadata:
            deleted_memory_ids: List of memory IDs to delete from vector store.
            memory_list: List of BaseMemory objects to insert into vector store.

        Sets context attributes:
            response.metadata["update_result"]: Dictionary with deletion and
                insertion counts.
        """
        workspace_id: str = self.context.workspace_id

        deleted_memory_ids: List[str] = self.context.response.metadata.get("deleted_memory_ids", [])
        if deleted_memory_ids:
            await self.vector_store.async_delete(node_ids=deleted_memory_ids, workspace_id=workspace_id)
            logger.info(f"delete memory_ids={json.dumps(deleted_memory_ids, indent=2)}")

        insert_memory_list: List[BaseMemory] = self.context.response.metadata.get("memory_list", [])
        if insert_memory_list:
            insert_nodes: List[VectorNode] = [x.to_vector_node() for x in insert_memory_list]
            await self.vector_store.async_insert(nodes=insert_nodes, workspace_id=workspace_id)
            logger.info(f"insert insert_node.size={len(insert_nodes)}")

        # Store results in context
        self.context.response.metadata["update_result"] = {
            "deleted_count": len(deleted_memory_ids) if deleted_memory_ids else 0,
            "inserted_count": len(insert_memory_list) if insert_memory_list else 0,
        }
