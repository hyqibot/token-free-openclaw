"""Base class for tools"""

from abc import ABCMeta

from . import BaseOp
from ..schema import ToolCall


class BaseTool(BaseOp, metaclass=ABCMeta):
    """Base class for tools"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._tool_call: ToolCall | None = None

    def _build_tool_call(self) -> ToolCall:
        """Build and return the tool call schema; override in subclasses."""

    def _validate_inputs(self):
        """Validate the inputs."""
        parameters = self.tool_call.parameters
        if parameters.type == "object" and parameters.properties:
            required_list = parameters.required or []
            required_keys = {k: (k in required_list) for k in parameters.properties.keys()}
            self.context.validate_required_keys(required_keys, self.name)

    @property
    def tool_call(self) -> ToolCall:
        """Get the tool call schema."""
        if self._tool_call is None:
            self._tool_call = self._build_tool_call()
            self._tool_call.name = self._tool_call.name or self.name
        return self._tool_call

    def set_tool_call(self, tool_call: ToolCall | dict):
        """Set the tool call schema."""
        if isinstance(tool_call, dict):
            self._tool_call = ToolCall(**tool_call)
        elif isinstance(tool_call, ToolCall):
            self._tool_call = tool_call
        else:
            raise ValueError(f"Invalid tool call: {tool_call}")

        self._tool_call.name = self._tool_call.name or self.name

    @property
    def input_dict(self) -> dict:
        """Get the input dict."""
        parameters = self.tool_call.parameters
        if parameters.type != "object" or not parameters.properties:
            return {}
        required_keys = set(parameters.required or [])
        return {k: self.context[k] for k in parameters.properties.keys() if (k in required_keys or k in self.context)}

    def before_execute_sync(self):
        """Hook before execute"""
        super().before_execute_sync()
        self._validate_inputs()
