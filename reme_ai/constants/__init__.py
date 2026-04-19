"""Constants module for ReMe AI.

This module provides access to all constants used throughout the application,
including common workflow keys and language-specific constants.
"""

from . import common_constants
from . import language_constants

# Export all constants from common_constants
from .common_constants import (
    WORKFLOW_NAME,
    RESULT,
    MEMORIES,
    CHAT_MESSAGES,
    CHAT_MESSAGES_SCATTER,
    CHAT_KWARGS,
    USER_NAME,
    TARGET_NAME,
    MEMORY_MANAGER,
    QUERY_WITH_TS,
    RETRIEVE_MEMORY_NODES,
    RANKED_MEMORY_NODES,
    NOT_REFLECTED_NODES,
    NOT_UPDATED_NODES,
    EXTRACT_TIME_DICT,
    NEW_OBS_NODES,
    NEW_OBS_WITH_TIME_NODES,
    INSIGHT_NODES,
    TODAY_NODES,
    MERGE_OBS_NODES,
    TIME_INFER,
)

# Export all constants from language_constants
from .language_constants import (
    DATATIME_WORD_LIST,
    WEEKDAYS,
    MONTH_DICT,
    NONE_WORD,
    REPEATED_WORD,
    CONTRADICTORY_WORD,
    CONTAINED_WORD,
    COLON_WORD,
    COMMA_WORD,
    DEFAULT_HUMAN_NAME,
    DATATIME_KEY_MAP,
    TIME_INFER_WORD,
    USER_NAME_EXPRESSION,
)

__all__ = [
    # Module exports
    "common_constants",
    "language_constants",
    # Common constants
    "WORKFLOW_NAME",
    "RESULT",
    "MEMORIES",
    "CHAT_MESSAGES",
    "CHAT_MESSAGES_SCATTER",
    "CHAT_KWARGS",
    "USER_NAME",
    "TARGET_NAME",
    "MEMORY_MANAGER",
    "QUERY_WITH_TS",
    "RETRIEVE_MEMORY_NODES",
    "RANKED_MEMORY_NODES",
    "NOT_REFLECTED_NODES",
    "NOT_UPDATED_NODES",
    "EXTRACT_TIME_DICT",
    "NEW_OBS_NODES",
    "NEW_OBS_WITH_TIME_NODES",
    "INSIGHT_NODES",
    "TODAY_NODES",
    "MERGE_OBS_NODES",
    "TIME_INFER",
    # Language constants
    "DATATIME_WORD_LIST",
    "WEEKDAYS",
    "MONTH_DICT",
    "NONE_WORD",
    "REPEATED_WORD",
    "CONTRADICTORY_WORD",
    "CONTAINED_WORD",
    "COLON_WORD",
    "COMMA_WORD",
    "DEFAULT_HUMAN_NAME",
    "DATATIME_KEY_MAP",
    "TIME_INFER_WORD",
    "USER_NAME_EXPRESSION",
]
