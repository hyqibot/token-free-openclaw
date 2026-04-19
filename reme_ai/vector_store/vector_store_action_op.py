"""Operation for performing various actions on vector store workspaces."""

from flowllm.core.context import C
from flowllm.core.op import BaseAsyncOp
from flowllm.core.schema import VectorNode

from reme_ai.schema.memory import vector_node_to_memory, dict_to_memory, BaseMemory


@C.register_op()
class VectorStoreActionOp(BaseAsyncOp):
    """Operation that performs various administrative actions on vector stores.

    This operation supports multiple actions:
    - copy: Copy memories from one workspace to another
    - delete: Delete an entire workspace
    - delete_ids: Delete specific memories by their IDs
    - dump: Export workspace memories to a file
    - list: List all memories in a workspace
    - load: Import memories from a file into a workspace
    """

    async def async_execute(self):
        """Execute the vector store action operation.

        Performs the action specified in context.action. The operation supports
        multiple action types, each requiring different context attributes.

        Expected context attributes:
            workspace_id: Target workspace ID for the operation.
            action: Action to perform ("copy", "delete", "delete_ids", "dump",
                "list", or "load").

        Additional context attributes by action:
            - copy: src_workspace_id (source workspace)
            - delete_ids: memory_ids (list of memory IDs to delete)
            - dump: path (file path to dump to)
            - load: path (file path to load from)

        Sets context attributes:
            response.metadata["action_result"]: Result of the action operation.
                Format varies by action type.

        Raises:
            ValueError: If an invalid action is specified.
        """
        workspace_id: str = self.context.workspace_id
        action: str = self.context.action
        result = ""
        if action == "copy":
            src_workspace_id: str = self.context.src_workspace_id
            result = await self.vector_store.async_copy_workspace(
                src_workspace_id=src_workspace_id,
                dest_workspace_id=workspace_id,
            )

        elif action == "delete":
            if await self.vector_store.async_exist_workspace(workspace_id):
                result = await self.vector_store.async_delete_workspace(workspace_id=workspace_id)

        elif action == "delete_ids":
            memory_ids: list = self.context.memory_ids
            result = await self.vector_store.async_delete(workspace_id=workspace_id, node_ids=memory_ids)

        elif action == "dump":
            path: str = self.context.path

            def node_to_memory(node: VectorNode) -> dict:
                assert isinstance(node, VectorNode)
                return vector_node_to_memory(node).model_dump()

            result = await self.vector_store.async_dump_workspace(
                workspace_id=workspace_id,
                path=path,
                callback_fn=node_to_memory,
            )

        elif action == "list":

            def node_to_memory(node: VectorNode) -> dict:
                return vector_node_to_memory(node).model_dump()

            result = await self.vector_store.async_list_workspace_nodes(workspace_id=workspace_id)
            result = [node_to_memory(node) for node in result]

        elif action == "load":
            path: str = self.context.path

            def memory_dict_to_node(memory_dict: dict) -> VectorNode:
                memory: BaseMemory = dict_to_memory(memory_dict=memory_dict)
                return memory.to_vector_node()

            result = await self.vector_store.async_load_workspace(
                workspace_id=workspace_id,
                path=path,
                callback_fn=memory_dict_to_node,
            )

        else:
            raise ValueError(f"invalid action={action}")

        self.context.response.metadata["action_result"] = str(result)
