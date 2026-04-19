"""Working-memory offload module based on compaction and compression.

This module implements a high-level *working summary* operation that orchestrates
message compaction and LLM-based compression to reduce token usage for long
conversations. It first compacts verbose tool messages, and, if the reduction
ratio is not sufficient, it further compresses the history with an LLM.

The offload process:
1. Compacts tool messages by storing full content in external files and keeping previews
2. Evaluates compaction effectiveness by comparing token counts before/after
3. If the compaction ratio exceeds a configurable threshold, applies LLM-based compression
"""

from flowllm.core.context import C
from flowllm.core.op import BaseAsyncOp
from flowllm.core.schema import Message
from loguru import logger

from reme_ai.enumeration import WorkingSummaryMode


@C.register_op()
class MessageOffloadOp(BaseAsyncOp):
    """
    Working-memory offload operation that orchestrates compaction and compression.

    This operation is designed specifically for *working memory summary* in long-running
    conversations. Its behavior is controlled by ``working_summary_mode``:

    - ``COMPACT``  – only compact verbose tool messages by storing full content externally
      and keeping short previews in the context.
    - ``COMPRESS`` – only apply LLM-based compression to generate a compact state snapshot.
    - ``AUTO``     – first run compaction, then optionally run compression if the
      compaction ratio is not sufficient.

    Context Parameters:
        working_summary_mode (WorkingSummaryMode | str): Working summary strategy to use.
            One of ``COMPACT``, ``COMPRESS`` or ``AUTO``. Defaults to ``AUTO``.
        compact_ratio_threshold (float): Only used in ``AUTO`` mode. Threshold for
            compaction ratio (compressed tokens divided by original tokens) above which
            LLM compression is applied. Defaults to 0.75.
    """

    async def async_execute(self):
        """
        Execute the working-memory offload operation.

        The behavior is selected via ``working_summary_mode``:

        - COMPACT: only compaction is executed.
        - COMPRESS: only compression is executed.
        - AUTO: compaction is executed first; if the reduction is insufficient, a
          compression pass is executed.
        """
        from .message_compact_op import MessageCompactOp
        from .message_compress_op import MessageCompressOp

        message_compact_op = MessageCompactOp()
        message_compress_op = MessageCompressOp()

        # Resolve working summary mode (string or enum) with AUTO as default.
        working_summary_mode = self.context.get("working_summary_mode", WorkingSummaryMode.AUTO)
        if isinstance(working_summary_mode, str):
            working_summary_mode = WorkingSummaryMode(working_summary_mode)

        if working_summary_mode == WorkingSummaryMode.COMPACT:
            logger.info("Working-memory offload mode: COMPACT (only compaction)")
            await message_compact_op.async_call(context=self.context)
            return

        if working_summary_mode == WorkingSummaryMode.COMPRESS:
            logger.info("Working-memory offload mode: COMPRESS (only compression)")
            await message_compress_op.async_call(context=self.context)
            return

        # AUTO mode: compaction first, then compression if reduction is not sufficient.
        logger.info("Working-memory offload mode: AUTO (compaction then optional compression)")
        await message_compact_op.async_call(context=self.context)

        origin_messages = [Message(**x) for x in self.context.messages]
        origin_token_cnt = self.token_count(origin_messages)

        result_messages = [Message(**x) for x in self.context.response.answer]
        answer_token_cnt = self.token_count(result_messages)

        if origin_token_cnt <= 0:
            logger.warning("Origin token count is 0 after compaction; skip compression stage")
            return

        compact_ratio = answer_token_cnt / origin_token_cnt
        compact_ratio_threshold: float = self.context.get("compact_ratio_threshold", 0.75)

        if compact_ratio > compact_ratio_threshold:
            logger.info(
                f"Working-memory offload: compact ratio {compact_ratio:.2f} > "
                f"{compact_ratio_threshold:.2f}, applying compression stage",
            )
            await message_compress_op.async_call(context=self.context)

    async def async_default_execute(self, e: Exception = None, **_kwargs):
        """Handle execution errors by returning original messages.

        This method is called when an exception occurs during async_execute. It preserves
        the original messages and marks the operation as unsuccessful.

        Args:
            e: The exception that occurred during execution, if any.
            **_kwargs: Additional keyword arguments (unused but required by interface).
        """
        self.context.response.answer = self.context.messages
        self.context.response.success = False
        self.context.response.metadata["error"] = str(e)
