"""Personal memory service for managing personalized memories.

This module provides the PersonalMemoryService class which extends the base
AgentscopeRuntimeMemoryService to handle personal memory operations.
It supports creating, retrieving, listing, and deleting personal memories
using flow-based execution.
"""

import asyncio
from typing import Optional, Dict, Any, List

from flowllm.core.schema import FlowResponse
from loguru import logger
from pydantic import Field, BaseModel

from reme_ai.schema.memory import PersonalMemory
from reme_ai.service.agentscope_runtime_memory_service import AgentscopeRuntimeMemoryService


class PersonalMemoryService(AgentscopeRuntimeMemoryService):
    """Service for managing personalized memories.

    PersonalMemoryService empowers you to generate, retrieve, and share
    customized memories. Leveraging advanced LLM, embedding, and vector store
    technologies, it builds a comprehensive memory system with intelligent,
    context- and time-aware memory management.
    """

    async def start(self):
        """Start the personal memory service.

        Returns:
            The result of starting the underlying application.
        """
        return await self.app.async_start()

    async def stop(self) -> None:
        """Stop the personal memory service.

        Releases resources and stops the underlying application.
        """
        return await self.app.async_stop()

    async def health(self) -> bool:
        """Check the health status of the service.

        Returns:
            True if the service is healthy, False otherwise.
        """
        return True

    async def add_memory(self, user_id: str, messages: list, session_id: Optional[str] = None) -> None:
        """Add personal memory from messages.

        Processes the provided messages and creates personal memories using
        the summary_personal_memory flow. The created memories are associated
        with the given session_id.

        Args:
            user_id: The user identifier.
            messages: List of messages (dict or BaseModel instances) to process.
            session_id: Optional session identifier to associate with the memory.
        """
        new_messages: List[dict] = []
        for message in messages:
            if isinstance(message, dict):
                new_messages.append(message)
            elif isinstance(message, BaseModel):
                new_messages.append(message.model_dump())
            else:
                raise ValueError(f"Invalid message type={type(message)}")

        kwargs = {
            "workspace_id": user_id,
            "trajectories": [
                {"messages": new_messages, "score": 1.0},
            ],
        }

        result: FlowResponse = await self.app.async_execute_flow(name="summary_personal_memory", **kwargs)
        memory_list: List[PersonalMemory] = result.metadata.get("memory_list", [])
        for memory in memory_list:
            memory_id = memory.memory_id
            self.add_session_memory_id(session_id, memory_id)
            logger.info(f"[personal_memory_service] user_id={user_id} session_id={session_id} add memory: {memory}")

    async def search_memory(
        self,
        user_id: str,
        messages: list,
        filters: Optional[Dict[str, Any]] = Field(
            description="Associated filters for the messages, " "such as top_k, score etc.",
            default=None,
        ),
    ) -> list:
        """Search for personal memories matching the given messages.

        Searches the memory store for personal memories relevant to the provided
        messages using the retrieve_personal_memory flow. The query is extracted
        from the last message in the messages list.

        Args:
            user_id: The user identifier.
            messages: List of messages (dict or BaseModel instances) to search with.
            filters: Optional filters including top_k for controlling search results.

        Returns:
            List containing the search result answer.
        """
        new_messages: List[dict] = []
        for message in messages:
            if isinstance(message, dict):
                new_messages.append(message)
            elif isinstance(message, BaseModel):
                new_messages.append(message.model_dump())
            else:
                raise ValueError(f"Invalid message type={type(message)}")

        # Extract query from the last message
        query = new_messages[-1]["content"] if messages else ""

        kwargs = {
            "workspace_id": user_id,
            "query": query,
            "top_k": filters.get("top_k", 1) if filters else 1,
        }

        result: FlowResponse = await self.app.async_execute_flow(name="retrieve_personal_memory", **kwargs)
        logger.info(f"[personal_memory_service] user_id={user_id} search result: {result.model_dump_json()}")

        return [result.answer]

    async def list_memory(
        self,
        user_id: str,
        filters: Optional[Dict[str, Any]] = Field(
            description="Associated filters for the messages, " "such as top_k, score etc.",
            default=None,
        ),
    ) -> list:
        """List all personal memories for a user.

        Retrieves all personal memories associated with the given user_id
        from the vector store.

        Args:
            user_id: The user identifier.
            filters: Optional filters (currently not used but kept for API consistency).

        Returns:
            List of memory items for the user.
        """
        result = await self.app.async_execute_flow(name="vector_store", workspace_id=user_id, action="list")
        logger.info(f"[personal_memory_service] list_memory result: {result}")

        result = result.metadata["action_result"]
        for i, line in enumerate(result):
            logger.info(f"[personal_memory_service] list memory.{i}={line}")
        return result

    async def delete_memory(self, user_id: str, session_id: Optional[str] = None) -> None:
        """Delete personal memories for a user session.

        Deletes all memories associated with the given session_id for the user.
        If no session_id is provided or no memories exist for the session,
        no deletion is performed.

        Args:
            user_id: The user identifier.
            session_id: Optional session identifier. If provided, only memories
                associated with this session will be deleted.
        """
        delete_ids = self.session_id_dict.get(session_id, [])
        if not delete_ids:
            return

        result = await self.app.async_execute_flow(
            name="vector_store",
            workspace_id=user_id,
            action="delete_ids",
            memory_ids=delete_ids,
        )
        result = result.metadata["action_result"]
        logger.info(f"[personal_memory_service] delete memory result={result}")


async def main():
    """Main function for testing the PersonalMemoryService.

    Demonstrates the usage of PersonalMemoryService by adding, searching,
    listing, and deleting personal memories.
    """
    async with PersonalMemoryService() as service:
        logger.info("========== start personal memory service ==========")

        await service.add_memory(
            user_id="u_12345",
            messages=[{"content": "I really enjoy playing tennis on weekends"}],
            session_id="s_123456",
        )

        await service.search_memory(
            user_id="u_12345",
            messages=[{"content": "What do I like to do for fun?"}],
            filters={"top_k": 1},
        )

        await service.list_memory(user_id="u_12345")
        await service.delete_memory(user_id="u_12345", session_id="s_123456")
        await service.list_memory(user_id="u_12345")

        logger.info("========== end personal memory service ==========")


if __name__ == "__main__":
    asyncio.run(main())
