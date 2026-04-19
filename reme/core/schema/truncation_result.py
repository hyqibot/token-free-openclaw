"""Truncation result schema for command output truncation."""

from typing import Literal

from pydantic import BaseModel, Field


class TruncationResult(BaseModel):
    """Result of output truncation operation.

    Attributes:
        content: The truncated content
        truncated: Whether truncation occurred
        total_lines: Total number of lines in original output
        output_lines: Number of lines in truncated output
        total_bytes: Total bytes in original output
        output_bytes: Bytes in truncated output
        truncated_by: What caused truncation ('lines' or 'bytes')
        last_line_partial: Whether last line was partially truncated
    """

    content: str = Field(description="The truncated content")
    truncated: bool = Field(description="Whether truncation occurred")
    total_lines: int = Field(description="Total number of lines in original output")
    output_lines: int = Field(description="Number of lines in truncated output")
    total_bytes: int = Field(description="Total bytes in original output")
    output_bytes: int = Field(description="Bytes in truncated output")
    truncated_by: Literal["lines", "bytes"] | None = Field(
        default=None,
        description="What caused truncation ('lines' or 'bytes')",
    )
    last_line_partial: bool = Field(
        default=False,
        description="Whether last line was partially truncated",
    )
