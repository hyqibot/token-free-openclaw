import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, TextIO, Tuple


@dataclass
class DotnetCoreRuntimeSpec:
    """Specification of an installed .NET Core runtime"""

    name: str
    version: str
    path: Path

    @property
    def version_info(self) -> Tuple[int, int, int, str]:
        base, _, suffix = self.version.partition("-")
        major, minor, patch = base.split(".")
        return (int(major), int(minor), int(patch), suffix)

    @property
    def tfm(self) -> str:
        return f"net{self.version_info[0]}.{self.version_info[1]}"

    @property
    def floor_version(self) -> str:
        return f"{self.version_info[0]}.{self.version_info[1]}.0"

    @property
    def runtime_config(self) -> Dict[str, Any]:
        return {
            "runtimeOptions": {
                "tfm": self.tfm,
                "framework": {"name": self.name, "version": self.floor_version},
            }
        }

    def write_config(self, f: TextIO) -> None:
        json.dump(self.runtime_config, f)
