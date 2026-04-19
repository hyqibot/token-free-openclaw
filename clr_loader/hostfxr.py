import sys
from pathlib import Path
from typing import Generator, Tuple, Optional

from .ffi import ffi, load_hostfxr
from .types import Runtime, RuntimeInfo, StrOrPath
from .util import check_result

__all__ = ["DotnetCoreRuntime"]

_IS_SHUTDOWN = False


class DotnetCoreRuntime(Runtime):
    _version: str

    def __init__(
        self,
        *,
        dotnet_root: Path,
        runtime_config: Optional[Path] = None,
        entry_dll: Optional[Path] = None,
        **params: str,
    ):
        self._handle = None

        if _IS_SHUTDOWN:
            raise RuntimeError("Runtime can not be reinitialized")

        self._dotnet_root = Path(dotnet_root)
        self._dll = load_hostfxr(self._dotnet_root)
        self._load_func = None

        if runtime_config is not None:
            self._handle = _get_handle_for_runtime_config(
                self._dll, self._dotnet_root, runtime_config
            )
        elif entry_dll is not None:
            self._handle = _get_handle_for_dotnet_command_line(
                self._dll, self._dotnet_root, entry_dll
            )
        else:
            raise ValueError("Either runtime_config or entry_dll must be provided")

        for key, value in params.items():
            self[key] = value

        # TODO: Get version
        self._version: str = "<undefined>"

    @property
    def dotnet_root(self) -> Path:
        return self._dotnet_root

    @property
    def is_initialized(self) -> bool:
        return self._load_func is not None

    @property
    def is_shutdown(self) -> bool:
        return _IS_SHUTDOWN

    def __getitem__(self, key: str) -> str:
        if self.is_shutdown:
            raise RuntimeError("Runtime is shut down")
        buf = ffi.new("char_t**")
        res = self._dll.hostfxr_get_runtime_property_value(
            self._handle, encode(key), buf
        )
        if res != 0:
            raise KeyError(key)

        return decode(buf[0])

    def __setitem__(self, key: str, value: str) -> None:
        if self.is_initialized:
            raise RuntimeError("Already initialized")

        res = self._dll.hostfxr_set_runtime_property_value(
            self._handle, encode(key), encode(value)
        )
        check_result(res)

    def __iter__(self) -> Generator[Tuple[str, str], None, None]:
        if self.is_shutdown:
            raise RuntimeError("Runtime is shut down")
        max_size = 100
        size_ptr = ffi.new("size_t*")
        size_ptr[0] = max_size

        keys_ptr = ffi.new("char_t*[]", max_size)
        values_ptr = ffi.new("char_t*[]", max_size)

        res = self._dll.hostfxr_get_runtime_properties(
            self._handle, size_ptr, keys_ptr, values_ptr
        )
        check_result(res)

        for i in range(size_ptr[0]):
            yield (decode(keys_ptr[i]), decode(values_ptr[i]))

    def _get_load_func(self):
        if self._load_func is None:
            self._load_func = _get_load_func(self._dll, self._handle)

        return self._load_func

    def _get_callable(self, assembly_path: StrOrPath, typename: str, function: str):
        # TODO: Maybe use coreclr_get_delegate as well, supported with newer API
        # versions of hostfxr

        # Append assembly name to typename
        assembly_path = Path(assembly_path)
        assembly_name = assembly_path.stem
        typename = f"{typename}, {assembly_name}"

        delegate_ptr = ffi.new("void**")
        res = self._get_load_func()(
            encode(str(assembly_path)),
            encode(typename),
            encode(function),
            ffi.NULL,
            ffi.NULL,
            delegate_ptr,
        )
        check_result(res)
        return ffi.cast("component_entry_point_fn", delegate_ptr[0])

    def shutdown(self) -> None:
        if self._handle and self._dll:
            self._dll.hostfxr_close(self._handle)
            self._handle = None

    def info(self):
        return RuntimeInfo(
            kind="CoreCLR",
            version=self._version,
            initialized=self._handle is not None,
            shutdown=self._handle is None,
            properties=dict(self) if not _IS_SHUTDOWN else {},
        )


def _get_handle_for_runtime_config(
    dll, dotnet_root: StrOrPath, runtime_config: StrOrPath
):
    params = ffi.new("hostfxr_initialize_parameters*")
    params.size = ffi.sizeof("hostfxr_initialize_parameters")
    # params.host_path = ffi.new("char_t[]", encode(sys.executable))
    params.host_path = ffi.NULL
    dotnet_root_p = ffi.new("char_t[]", encode(str(Path(dotnet_root))))
    params.dotnet_root = dotnet_root_p

    handle_ptr = ffi.new("hostfxr_handle*")

    res = dll.hostfxr_initialize_for_runtime_config(
        encode(str(Path(runtime_config))), params, handle_ptr
    )
    check_result(res)

    return handle_ptr[0]


def _get_handle_for_dotnet_command_line(
    dll, dotnet_root: StrOrPath, entry_dll: StrOrPath
):
    params = ffi.new("hostfxr_initialize_parameters*")
    params.size = ffi.sizeof("hostfxr_initialize_parameters")
    params.host_path = ffi.NULL
    dotnet_root_p = ffi.new("char_t[]", encode(str(Path(dotnet_root))))
    params.dotnet_root = dotnet_root_p

    handle_ptr = ffi.new("hostfxr_handle*")

    args_ptr = ffi.new("char_t*[1]")
    arg_ptr = ffi.new("char_t[]", encode(str(Path(entry_dll))))
    args_ptr[0] = arg_ptr
    res = dll.hostfxr_initialize_for_dotnet_command_line(
        1, args_ptr, params, handle_ptr
    )

    check_result(res)

    return handle_ptr[0]


def _get_load_func(dll, handle):
    delegate_ptr = ffi.new("void**")

    res = dll.hostfxr_get_runtime_delegate(
        handle, dll.hdt_load_assembly_and_get_function_pointer, delegate_ptr
    )
    check_result(res)

    return ffi.cast("load_assembly_and_get_function_pointer_fn", delegate_ptr[0])


if sys.platform == "win32":

    def encode(string: str):
        return string

    def decode(char_ptr) -> str:
        return ffi.string(char_ptr)

else:

    def encode(string: str):
        return string.encode("utf8")

    def decode(char_ptr) -> str:
        return ffi.string(char_ptr).decode("utf8")
