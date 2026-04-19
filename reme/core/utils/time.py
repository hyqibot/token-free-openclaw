"""
Utility module for timing function execution with log metadata preservation.
"""

import datetime
import functools
import inspect
import time
from typing import Any, Callable, TypeVar, cast

from loguru import logger

# Type variable to preserve the signature of the decorated callable
F = TypeVar("F", bound=Callable[..., Any])


def get_now_time() -> str:
    """Get current timestamp in YYYY-MM-DD HH:MM:SS format.

    Returns:
        str: Current timestamp string in format 'YYYY-MM-DD HH:MM:SS'.
    """
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def timer(func: F) -> F:
    """
    Decorator that logs execution time and patches log records with original function metadata.
    """
    # Extract original function metadata to ensure logs point to the correct source
    func_name = func.__name__
    try:
        # Retrieve the source file path and the starting line number
        file_path = inspect.getsourcefile(func) or "unknown"
        _, line_no = inspect.getsourcelines(func)
    except Exception:
        file_path = "unknown"
        line_no = 0

    def create_patcher(instance):
        """Creates a patcher with runtime class information."""
        # Get the actual class name at runtime if this is a method
        if instance is not None and hasattr(instance, "__class__"):
            class_name = instance.__class__.__name__
            display_name = f"{class_name}.{func_name}"
        else:
            display_name = func_name

        def patcher(record):
            """Modifies the log record to reflect the decorated function's location."""
            record["function"] = display_name
            record["file"].name = file_path.split("/")[-1]
            record["file"].path = file_path
            record["line"] = line_no

        return patcher

    @functools.wraps(func)
    async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
        """Timer wrapper for asynchronous functions."""
        start_time = time.perf_counter()
        try:
            return await func(*args, **kwargs)
        finally:
            duration = time.perf_counter() - start_time
            # Get the instance (self) if this is a method call
            instance = args[0] if args else None
            patcher = create_patcher(instance)
            # Use patch to inject metadata instead of relying on stack depth
            logger.patch(patcher).info(
                "========== cost={:.6f}s ==========",
                duration,
            )

    @functools.wraps(func)
    def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
        """Timer wrapper for synchronous functions."""
        start_time = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            duration = time.perf_counter() - start_time
            # Get the instance (self) if this is a method call
            instance = args[0] if args else None
            patcher = create_patcher(instance)
            logger.patch(patcher).info(
                "========== cost={:.6f}s ==========",
                duration,
            )

    if inspect.iscoroutinefunction(func):
        return cast(F, async_wrapper)
    return cast(F, sync_wrapper)
