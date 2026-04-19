"""Working-memory summary package for the ReMe framework.

This package provides *working-memory* oriented summary operations that can be used in
LLM-powered flows to reduce token usage and keep the active message window small, while
preserving access to detailed historical information when needed. It includes:

- MessageCompactOp: Compact verbose tool messages by storing full content in external files
  and keeping short previews in the working context.
- MessageCompressOp: Compress conversation history using an LLM to generate dense summaries
  that represent the agent's state snapshot.
- MessageOffloadOp: Orchestrate compaction and optional compression as a unified
  working-memory offload pipeline.
"""

from .message_compact_op import MessageCompactOp
from .message_compress_op import MessageCompressOp
from .message_offload_op import MessageOffloadOp

__all__ = [
    "MessageCompactOp",
    "MessageCompressOp",
    "MessageOffloadOp",
]
