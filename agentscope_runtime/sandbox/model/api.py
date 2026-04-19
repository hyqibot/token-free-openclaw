# -*- coding: utf-8 -*-
from typing import Optional

from pydantic import BaseModel, Field


class RuntimeDiffResult(BaseModel):
    diff: Optional[str] = Field(
        None,
        description="The modifications in the filesystem since the "
        "last check.",
    )
    url: Optional[str] = Field(
        None,
        description="The current position where the browser is located.",
    )
