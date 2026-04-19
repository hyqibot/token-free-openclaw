"""Working summary mode enumeration module.

This module defines the strategies for working-memory style summarization in the
ReMe system.
"""

from enum import Enum


class WorkingSummaryMode(str, Enum):
    """
    Enumeration representing working summary strategies.

    Members:
        - COMPACT: Only compact verbose tool messages into previews.
        - COMPRESS: Only apply LLM-based compression over the history.
        - AUTO: First compact messages, then optionally compress if needed.
    """

    COMPACT = "compact"
    COMPRESS = "compress"
    AUTO = "auto"
