# -*- coding: utf-8 -*-
"""Allow running CoPaw via ``python -m copaw``."""
from .utils.packaged_runtime import configure_packaged_runtime_defaults

configure_packaged_runtime_defaults()

# 测试诊断：追踪谁触发了 ``-m`` 子进程（仅在设置 COPAW_TRACE_M=1 时启用）
from .utils.trace_m_flag import install_trace_m_flag_from_env

install_trace_m_flag_from_env()

# Nuitka: make dynamically discovered subpackages visible to standalone builds.
# These imports are not executed at runtime.
if False:  # pragma: no cover
    from .agents import hooks as _agent_hooks  # noqa: F401
    from .agents import memory as _agent_memory  # noqa: F401
    from .agents import tools as _agent_tools  # noqa: F401

from .cli.main import cli

if __name__ == "__main__":
    cli()  # pylint: disable=no-value-for-parameter
