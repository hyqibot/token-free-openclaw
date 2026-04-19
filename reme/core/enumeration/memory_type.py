"""Defines the high-level categories of memory managed by ReMe.

This enumeration is used across the system to tag, route, and store different
kinds of memories (identity, personal context, procedures, tools, etc.).
"""

from enum import Enum


class MemoryType(str, Enum):
    """Enumeration of memory categories used by the memory subsystem.

    These types describe *what* a piece of memory is about, which guides
    storage, retrieval, and summarization strategies.
    """

    # Long‑term, relatively stable attributes about the user (name, roles, etc.)
    IDENTITY = "identity"

    # User-specific preferences, habits, and evolving personal context
    PERSONAL = "personal"

    # How‑to knowledge, workflows, and step‑by‑step instructions
    PROCEDURAL = "procedural"

    # Information learned about tools, APIs, and their usage patterns
    TOOL = "tool"

    # Condensed representation of larger memory collections
    SUMMARY = "summary"

    # Raw chronological interaction history, typically before summarization
    HISTORY = "history"
