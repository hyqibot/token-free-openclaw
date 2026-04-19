# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

"""异步 HTTP Session 管理器，用于管理 aiohttp.ClientSession 的连接池复用"""

import asyncio
import ssl
from typing import Optional

import aiohttp
import certifi

from dashscope.common.logging import logger


class AioConnectionPoolConfig:
    """异步连接池配置类"""

    def __init__(
        self,
        limit: int = 100,
        limit_per_host: int = 30,
        ttl_dns_cache: int = 300,
        keepalive_timeout: int = 30,
        force_close: bool = False,
    ):
        """
        初始化异步连接池配置

        Args:
            limit: 总连接数限制，默认 100
            limit_per_host: 每个主机的连接数限制，默认 30
            ttl_dns_cache: DNS 缓存 TTL（秒），默认 300
            keepalive_timeout: Keep-Alive 超时（秒），默认 30
            force_close: 是否强制关闭连接，默认 False

        Raises:
            ValueError: 当参数值不合法时
        """
        if limit <= 0:
            raise ValueError(f"limit ({limit}) 必须 > 0")
        if limit_per_host <= 0:
            raise ValueError(f"limit_per_host ({limit_per_host}) 必须 > 0")
        if limit_per_host > limit:
            raise ValueError(
                f"limit_per_host ({limit_per_host}) 必须 <= " f"limit ({limit})",
            )
        if ttl_dns_cache < 0:
            raise ValueError(f"ttl_dns_cache ({ttl_dns_cache}) 必须 >= 0")
        if keepalive_timeout < 0:
            raise ValueError(
                f"keepalive_timeout ({keepalive_timeout}) 必须 >= 0",
            )

        self.limit = limit
        self.limit_per_host = limit_per_host
        self.ttl_dns_cache = ttl_dns_cache
        self.keepalive_timeout = keepalive_timeout
        self.force_close = force_close

    def __repr__(self):
        return (
            f"AioConnectionPoolConfig(limit={self.limit}, "
            f"limit_per_host={self.limit_per_host}, "
            f"ttl_dns_cache={self.ttl_dns_cache}, "
            f"keepalive_timeout={self.keepalive_timeout}, "
            f"force_close={self.force_close})"
        )


class AioSessionManager:
    """
    异步 HTTP Session 管理器（单例模式）

    用于管理全局的 aiohttp.ClientSession 实例，实现异步 HTTP 连接复用。

    特性：
    - 单例模式：全局唯一实例
    - 异步锁保护：使用 asyncio.Lock 保护并发访问
    - 连接池配置：支持自定义 TCPConnector 参数
    - 生命周期管理：支持启用、禁用、重置
    - 向后兼容：默认禁用，不影响现有代码

    Examples:
        >>> import asyncio
        >>> from dashscope.common.aio_session_manager import AioSessionManager
        >>>
        >>> async def main():
        ...     manager = await AioSessionManager.get_instance()
        ...     await manager.enable(limit=200, limit_per_host=50)
        ...     session = await manager.get_session()
        ...     # 使用 session 进行请求
        ...     await manager.disable()
        >>>
        >>> asyncio.run(main())
    """

    _instance: Optional["AioSessionManager"] = None
    _lock = asyncio.Lock()

    def __init__(self):
        """初始化 Session 管理器（私有，通过 get_instance 获取）"""
        self._enabled = False
        self._session: Optional[aiohttp.ClientSession] = None
        self._session_lock = asyncio.Lock()
        self._config = AioConnectionPoolConfig()
        logger.debug("AioSessionManager initialized")

    @classmethod
    async def get_instance(cls) -> "AioSessionManager":
        """
        获取单例实例（异步）

        Returns:
            AioSessionManager: 单例实例
        """
        if cls._instance is None:
            async with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
                    logger.debug(
                        "AioSessionManager singleton instance created",
                    )
        return cls._instance

    @classmethod
    async def reset_instance(cls):
        """
        重置单例实例（仅用于测试）

        警告：此方法仅应在测试环境中使用
        """
        async with cls._lock:
            if cls._instance is not None:
                await cls._instance.disable()
                await cls._instance.reset()
            cls._instance = None
            logger.debug("AioSessionManager singleton instance reset")

    async def enable(
        self,
        limit: int = None,
        limit_per_host: int = None,
        ttl_dns_cache: int = None,
        keepalive_timeout: int = None,
        force_close: bool = None,
    ):
        """
        启用异步连接池复用

        Args:
            limit: 总连接数限制，默认 100
            limit_per_host: 每个主机的连接数限制，默认 30
            ttl_dns_cache: DNS 缓存 TTL（秒），默认 300
            keepalive_timeout: Keep-Alive 超时（秒），默认 30
            force_close: 是否强制关闭连接，默认 False

        Examples:
            >>> manager = await AioSessionManager.get_instance()
            >>> await manager.enable(limit=200, limit_per_host=50)
        """
        async with self._session_lock:
            # 如果提供了配置参数，先配置
            if any(
                param is not None
                for param in [
                    limit,
                    limit_per_host,
                    ttl_dns_cache,
                    keepalive_timeout,
                    force_close,
                ]
            ):
                await self._configure(
                    limit=limit,
                    limit_per_host=limit_per_host,
                    ttl_dns_cache=ttl_dns_cache,
                    keepalive_timeout=keepalive_timeout,
                    force_close=force_close,
                )

            self._enabled = True
            await self._ensure_session()
            logger.info(
                "Async HTTP connection pool enabled with config: %s",
                self._config,
            )

    async def disable(self):
        """
        禁用异步连接池复用

        关闭当前 Session 并禁用连接池功能

        Examples:
            >>> manager = await AioSessionManager.get_instance()
            >>> await manager.disable()
        """
        async with self._session_lock:
            self._enabled = False
            if self._session and not self._session.closed:
                await self._session.close()
                logger.debug("Async ClientSession closed")
            self._session = None
            logger.info("Async HTTP connection pool disabled")

    async def configure(
        self,
        limit: int = None,
        limit_per_host: int = None,
        ttl_dns_cache: int = None,
        keepalive_timeout: int = None,
        force_close: bool = None,
    ):
        """
        配置连接池参数

        Args:
            limit: 总连接数限制
            limit_per_host: 每个主机的连接数限制
            ttl_dns_cache: DNS 缓存 TTL（秒）
            keepalive_timeout: Keep-Alive 超时（秒）
            force_close: 是否强制关闭连接

        Examples:
            >>> manager = await AioSessionManager.get_instance()
            >>> await manager.configure(limit=200, limit_per_host=50)
        """
        async with self._session_lock:
            await self._configure(
                limit=limit,
                limit_per_host=limit_per_host,
                ttl_dns_cache=ttl_dns_cache,
                keepalive_timeout=keepalive_timeout,
                force_close=force_close,
            )

    async def _configure(
        self,
        limit: int = None,
        limit_per_host: int = None,
        ttl_dns_cache: int = None,
        keepalive_timeout: int = None,
        force_close: bool = None,
    ):
        """内部配置方法（无锁）"""
        config_params = {}
        if limit is not None:
            config_params["limit"] = limit
        if limit_per_host is not None:
            config_params["limit_per_host"] = limit_per_host
        if ttl_dns_cache is not None:
            config_params["ttl_dns_cache"] = ttl_dns_cache
        if keepalive_timeout is not None:
            config_params["keepalive_timeout"] = keepalive_timeout
        if force_close is not None:
            config_params["force_close"] = force_close

        if config_params:
            # 创建新配置
            limit = config_params.get("limit", self._config.limit)
            limit_per_host = config_params.get(
                "limit_per_host",
                self._config.limit_per_host,
            )
            ttl_dns_cache = config_params.get(
                "ttl_dns_cache",
                self._config.ttl_dns_cache,
            )
            keepalive_timeout = config_params.get(
                "keepalive_timeout",
                self._config.keepalive_timeout,
            )
            force_close = config_params.get(
                "force_close",
                self._config.force_close,
            )

            new_config = AioConnectionPoolConfig(
                limit=limit,
                limit_per_host=limit_per_host,
                ttl_dns_cache=ttl_dns_cache,
                keepalive_timeout=keepalive_timeout,
                force_close=bool(force_close),
            )
            self._config = new_config

            # 如果已启用，重新创建 Session
            if self._enabled:
                if self._session and not self._session.closed:
                    await self._session.close()
                self._session = None
                await self._ensure_session()
                logger.info(
                    "Async connection pool reconfigured: %s",
                    self._config,
                )

    async def _ensure_session(self):
        """确保 Session 存在且有效（内部方法，无锁）"""
        if self._session is None or self._session.closed:
            connector = aiohttp.TCPConnector(
                limit=self._config.limit,
                limit_per_host=self._config.limit_per_host,
                ttl_dns_cache=self._config.ttl_dns_cache,
                keepalive_timeout=self._config.keepalive_timeout,
                force_close=self._config.force_close,
                ssl=ssl.create_default_context(cafile=certifi.where()),
            )
            self._session = aiohttp.ClientSession(connector=connector)
            logger.debug(
                "New async ClientSession created with config: %s",
                self._config,
            )

    async def get_session(self) -> Optional[aiohttp.ClientSession]:
        """
        获取 Session（如果启用）

        Returns:
            Optional[aiohttp.ClientSession]: 如果启用返回 Session，否则返回 None

        Examples:
            >>> manager = await AioSessionManager.get_instance()
            >>> await manager.enable()
            >>> session = await manager.get_session()
            >>> if session:
            ...     # 使用 session 进行请求
            ...     pass
        """
        async with self._session_lock:
            if self._enabled:
                await self._ensure_session()
                return self._session
            return None

    async def get_session_direct(self) -> Optional[aiohttp.ClientSession]:
        """
        直接获取 Session（不检查启用状态）

        Returns:
            Optional[aiohttp.ClientSession]: 当前 Session 或 None

        Note:
            此方法主要用于测试，一般应使用 get_session()
        """
        async with self._session_lock:
            return self._session

    async def reset(self):
        """
        重置 Session

        关闭当前 Session 并根据启用状态重新创建

        Examples:
            >>> manager = await AioSessionManager.get_instance()
            >>> await manager.reset()
        """
        async with self._session_lock:
            if self._session and not self._session.closed:
                await self._session.close()
                logger.debug("Async ClientSession closed during reset")
            self._session = None
            if self._enabled:
                await self._ensure_session()
                logger.info("Async HTTP connection pool reset")

    def get_config(self) -> AioConnectionPoolConfig:
        """
        获取当前连接池配置

        Returns:
            AioConnectionPoolConfig: 当前配置

        Examples:
            >>> manager = await AioSessionManager.get_instance()
            >>> config = manager.get_config()
            >>> print(config.limit)
        """
        return self._config

    def is_enabled(self) -> bool:
        """
        检查连接池是否已启用

        Returns:
            bool: 是否已启用

        Examples:
            >>> manager = await AioSessionManager.get_instance()
            >>> if manager.is_enabled():
            ...     print("Connection pool is enabled")
        """
        return self._enabled

    async def has_active_session(self) -> bool:
        """
        检查是否有活跃的 Session

        Returns:
            bool: 是否有活跃的 Session

        Examples:
            >>> manager = await AioSessionManager.get_instance()
            >>> if await manager.has_active_session():
            ...     print("Active session exists")
        """
        async with self._session_lock:
            return self._session is not None and not self._session.closed
