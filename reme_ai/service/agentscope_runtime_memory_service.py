"""Base memory service for Agentscope runtime integration.

This module provides the abstract base class AgentscopeRuntimeMemoryService
which defines the interface for memory services that integrate with
Agentscope runtime. Concrete implementations should inherit from this class
and implement the abstract methods.
"""

from abc import abstractmethod, ABC
from typing import Optional, Dict, Any

from pydantic import Field

from reme_ai.main import ReMeApp


class AgentscopeRuntimeMemoryService(ABC):
    """Abstract base class for memory services integrated with Agentscope runtime.

    This class provides a common interface for memory services and manages
    the underlying ReMeApp instance and session-to-memory-id mappings.
    Subclasses must implement the abstract methods to provide specific
    memory management functionality.
    """

    def __init__(self):
        """Initialize the memory service.

        Creates a new ReMeApp instance and initializes the session-to-memory-id
        mapping dictionary.
        """
        self.app = ReMeApp()
        self.session_id_dict: dict = {}

    def add_session_memory_id(self, session_id: str, memory_id):
        """Add a memory ID to a session's memory list.

        Associates a memory_id with a session_id by adding it to the
        session's memory list. If the session doesn't exist, it will
        be created.

        Args:
            session_id: The session identifier.
            memory_id: The memory identifier to associate with the session.
        """
        if session_id not in self.session_id_dict:
            self.session_id_dict[session_id] = []

        self.session_id_dict[session_id].append(memory_id)

    @abstractmethod
    async def start(self) -> None:
        """Starts the service, initializing any necessary resources or
        connections."""

    @abstractmethod
    async def stop(self) -> None:
        """Stops the service, releasing any acquired resources."""

    @abstractmethod
    async def health(self) -> bool:
        """
        Checks the health of the service.

        Returns:
            True if the service is healthy, False otherwise.
        """

    async def __aenter__(self):
        """Async context manager entry.

        Starts the service when entering an async context.

        Returns:
            The service instance.
        """
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit.

        Stops the service when exiting an async context.

        Args:
            exc_type: Exception type if an exception occurred.
            exc_val: Exception value if an exception occurred.
            exc_tb: Exception traceback if an exception occurred.

        Returns:
            False to propagate exceptions, True to suppress them.
        """
        await self.stop()
        return False

    @abstractmethod
    async def add_memory(
        self,
        user_id: str,
        messages: list,
        session_id: Optional[str] = None,
    ) -> None:
        """
        Adds messages to the memory service.

        Args:
            user_id: The user id.
            messages: The messages to add.
            session_id: The session id, which is optional.
        """

    @abstractmethod
    async def search_memory(
        self,
        user_id: str,
        messages: list,
        filters: Optional[Dict[str, Any]] = Field(
            description="Associated filters for the messages, " "such as top_k, score etc.",
            default=None,
        ),
    ) -> list:
        """
        Searches messages from the memory service.

        Args:
            user_id: The user id.
            messages: The user query or the query with history messages,
                both in the format of list of messages.  If messages is a list,
                the search will be based on the content of the last message.
            filters: The filters used to search memory
        """

    @abstractmethod
    async def list_memory(
        self,
        user_id: str,
        filters: Optional[Dict[str, Any]] = Field(
            description="Associated filters for the messages, " "such as top_k, score etc.",
            default=None,
        ),
    ) -> list:
        """
        Lists the memory items for a given user with filters, such as
        page_num, page_size, etc.

        Args:
            user_id: The user id.
            filters: The filters for the memory items.
        """

    @abstractmethod
    async def delete_memory(
        self,
        user_id: str,
        session_id: Optional[str] = None,
    ) -> None:
        """
        Deletes the memory items for a given user with certain session id,
        or all the memory items for a given user.
        """
