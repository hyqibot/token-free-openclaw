"""Configuration module for ReMe.

This module provides configuration parsing capabilities for the ReMe framework.
It includes:

- ConfigParser: Configuration parser class that extends PydanticConfigParser
  to provide configuration parsing with awareness of the current module location
"""

from .config_parser import ConfigParser

__all__ = [
    "ConfigParser",
]
