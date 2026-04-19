"""Operation for recalling memories from the vector store based on a query."""

from typing import List

from flowllm.core.context import C
from flowllm.core.op import BaseAsyncOp
from flowllm.core.schema import VectorNode
from loguru import logger

from reme_ai.schema.memory import BaseMemory, vector_node_to_memory


@C.register_op()
class RecallVectorStoreOp(BaseAsyncOp):
    """Operation that retrieves relevant memories from the vector store.

    This operation performs a semantic search on the vector store to find
    memories relevant to a given query. It supports optional score filtering
    and deduplication based on memory content.
    """

    async def async_execute(self):
        """Execute the memory recall operation.

        Performs a semantic search in the vector store using the provided query,
        retrieves the top-k most relevant memories, and optionally filters them
        by a score threshold. Duplicate memories (based on content) are removed.

        Expected context attributes:
            workspace_id: The workspace ID to search memories in.
            query: The search query string (or key specified by recall_key).

        Expected op_params:
            recall_key: Key in context containing the query (default: "query").
            threshold_score: Optional minimum score threshold for filtering.

        Context attributes used:
            top_k: Number of top results to retrieve (default: 3).

        Sets context attributes:
            response.metadata["memory_list"]: List of retrieved BaseMemory objects.
        """
        recall_key: str = self.op_params.get("recall_key", "query")
        top_k: int = self.context.get("top_k", 3)

        query: str = self.context[recall_key]
        assert query, "query should be not empty!"

        workspace_id: str = self.context.workspace_id
        nodes: List[VectorNode] = await self.vector_store.async_search(
            query=query,
            workspace_id=workspace_id,
            top_k=top_k,
        )
        memory_list: List[BaseMemory] = []
        memory_content_list: List[str] = []
        for node in nodes:
            memory: BaseMemory = vector_node_to_memory(node)
            if memory.content not in memory_content_list:
                memory_list.append(memory)
                memory_content_list.append(memory.content)
        logger.info(f"retrieve memory.size={len(memory_list)}")

        threshold_score: float | None = self.op_params.get("threshold_score", None)
        if threshold_score is not None:
            memory_list = [mem for mem in memory_list if mem.score >= threshold_score or mem.score is None]
            logger.info(f"after filter by threshold_score size={len(memory_list)}")

        self.context.response.metadata["memory_list"] = memory_list
