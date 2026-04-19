"""Configuration parser module for ReMe.

This module provides configuration parsing capabilities for the ReMe framework.
It extends the PydanticConfigParser from FlowLLM to provide configuration parsing
with awareness of the current module location.
"""

from flowllm.core.utils import PydanticConfigParser


class ConfigParser(PydanticConfigParser):
    """Configuration parser for ReMe framework.

    Extends PydanticConfigParser to provide configuration parsing capabilities
    with awareness of the current module location. Uses the default.yaml
    configuration file as the default configuration source.

    Attributes:
        current_file: Path to the current file, used for relative config file resolution.
        default_config_name: Default configuration file name (without .yaml extension).
    """

    current_file: str = __file__
    default_config_name: str = "default"
