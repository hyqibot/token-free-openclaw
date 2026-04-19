"""Defines the data structure for individual vector embedding nodes within a retrieval system."""

from uuid import uuid4

from pydantic import BaseModel, Field


class VectorNode(BaseModel):
    """Represents a discrete unit of text content paired with its corresponding vector embedding and metadata."""

    vector_id: str = Field(default_factory=lambda: uuid4().hex)
    content: str = Field(default="")
    vector: list[float] | None = Field(default=None)
    metadata: dict[str, str | bool | int | float] = Field(default_factory=dict)
