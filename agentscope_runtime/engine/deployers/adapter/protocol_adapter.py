# -*- coding: utf-8 -*-
from abc import ABC, abstractmethod
from typing import Any, Callable


class ProtocolAdapter(ABC):
    def __init__(self, **kwargs):
        self._kwargs = kwargs

    @abstractmethod
    def add_endpoint(self, app, func: Callable, **kwargs) -> Any:
        """
        Add an endpoint to the protocol adapter.

        This method should be implemented by subclasses to provide
        protocol-specific endpoint addition functionality.

        Args:
            *args: Variable length argument list for endpoint configuration
            **kwargs: Arbitrary keyword arguments for endpoint configuration

        Returns:
            Any: The result of adding the endpoint, implementation-dependent
        """
