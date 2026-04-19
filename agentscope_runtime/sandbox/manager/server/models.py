# -*- coding: utf-8 -*-
from typing import Optional
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Error response model"""

    error: str
    detail: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response model"""

    status: str
    version: str
