"""Provides a collection of standard HTTP request methods."""

from enum import Enum


class HttpEnum(str, Enum):
    """Enumeration of supported HTTP methods for network requests."""

    # Retrieves data from a specified resource
    GET = "get"

    # Submits data to be processed to a specified resource
    POST = "post"

    # Identical to GET but only retrieves the response headers
    HEAD = "head"

    # Uploads or replaces the representation of a target resource
    PUT = "put"

    # Deletes the specified resource from the server
    DELETE = "delete"
