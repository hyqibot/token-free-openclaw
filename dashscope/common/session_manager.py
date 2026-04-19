# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

import threading
from typing import Optional

import requests
from requests.adapters import HTTPAdapter

from dashscope.common.logging import logger


class ConnectionPoolConfig:
    """
    连接池配置类

    提供类型安全和参数验证的配置方式
    """

    def __init__(
        self,
        pool_connections: int = 10,
        pool_maxsize: int = 20,
        max_retries: int = 3,
        pool_block: bool = False,
    ):
        """
        初始化连接池配置

        Args:
            pool_connections: 连接池大小，默认 10
                - 低并发（< 10 req/s）: 10
                - 中并发（10-50 req/s）: 20-30
                - 高并发（> 50 req/s）: 50-100

            pool_maxsize: 最大连接数，默认 20
                - 应该 >= pool_connections
                - 低并发: 20
                - 中并发: 50
                - 高并发: 100-200

            max_retries: 重试次数，默认 3
                - 网络稳定: 3
                - 网络不稳定: 5-10

            pool_block: 连接池满时是否阻塞，默认 False
                - False: 连接池满时创建新连接（推荐）
                - True: 连接池满时等待可用连接
        """
        # 参数验证
        if pool_connections < 1:
            raise ValueError("pool_connections 必须 >= 1")
        if pool_maxsize < pool_connections:
            raise ValueError("pool_maxsize 必须 >= pool_connections")
        if max_retries < 0:
            raise ValueError("max_retries 必须 >= 0")

        self.pool_connections = pool_connections
        self.pool_maxsize = pool_maxsize
        self.max_retries = max_retries
        self.pool_block = pool_block

    def to_dict(self):
        """转换为字典格式"""
        return {
            "pool_connections": self.pool_connections,
            "pool_maxsize": self.pool_maxsize,
            "max_retries": self.max_retries,
            "pool_block": self.pool_block,
        }

    def __repr__(self):
        return (
            f"ConnectionPoolConfig("
            f"pool_connections={self.pool_connections}, "
            f"pool_maxsize={self.pool_maxsize}, "
            f"max_retries={self.max_retries}, "
            f"pool_block={self.pool_block})"
        )


class SessionManager:
    """
    全局 HTTP Session 管理器

    特性：
    1. 线程安全的 Session 池
    2. 支持全局启用/禁用连接复用
    3. 支持自定义 Session 配置
    4. 自动清理和重建机制
    """

    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self._enabled = False  # 默认关闭，保持向后兼容
        self._session = None
        self._session_lock = threading.RLock()
        self._config = ConnectionPoolConfig()  # 使用配置类

    @classmethod
    def get_instance(cls):
        """单例模式获取实例"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls):
        """
        重置单例实例（仅用于测试）

        警告：此方法仅应在测试环境中使用
        """
        with cls._lock:
            if cls._instance is not None:
                cls._instance.disable()
                cls._instance.reset()
            cls._instance = None

    def enable(
        self,
        pool_connections: Optional[int] = None,
        pool_maxsize: Optional[int] = None,
        max_retries: Optional[int] = None,
        pool_block: Optional[bool] = None,
    ):
        """
        启用连接复用

        Args:
            pool_connections: 连接池大小，默认 10
            pool_maxsize: 最大连接数，默认 20
            max_retries: 重试次数，默认 3
            pool_block: 连接池满时是否阻塞，默认 False

        Examples:
            # 使用默认配置
            enable()

            # 使用命名参数
            enable(pool_connections=50, pool_maxsize=100)
        """
        with self._session_lock:
            # 使用命名参数更新配置
            if pool_connections is not None:
                self._config.pool_connections = pool_connections
            if pool_maxsize is not None:
                self._config.pool_maxsize = pool_maxsize
            if max_retries is not None:
                self._config.max_retries = max_retries
            if pool_block is not None:
                self._config.pool_block = pool_block

            # 参数验证
            if self._config.pool_maxsize < self._config.pool_connections:
                raise ValueError(
                    f"pool_maxsize ({self._config.pool_maxsize}) 必须 >= "
                    f"pool_connections ({self._config.pool_connections})",
                )

            self._enabled = True
            self._ensure_session()
            logger.info(
                "HTTP connection pool enabled with config: %s",
                self._config,
            )

    def disable(self):
        """禁用连接复用，关闭现有 Session"""
        with self._session_lock:
            self._enabled = False
            if self._session:
                try:
                    self._session.close()
                except Exception as e:
                    logger.warning("Error closing session: %s", e)
                finally:
                    self._session = None
            logger.info("HTTP connection pool disabled")

    def is_enabled(self):
        """检查是否启用连接复用"""
        return self._enabled

    def get_config(self) -> ConnectionPoolConfig:
        """
        获取当前连接池配置

        Returns:
            ConnectionPoolConfig: 当前配置对象
        """
        return self._config

    def has_active_session(self) -> bool:
        """
        检查是否有活跃的 Session

        Returns:
            bool: 如果存在活跃的 Session 返回 True，否则返回 False
        """
        with self._session_lock:
            return self._session is not None

    def _ensure_session(self):
        """确保 Session 存在且有效（需要持有锁）"""
        if self._session is None:
            self._session = requests.Session()

            # 配置连接池
            adapter = HTTPAdapter(
                pool_connections=self._config.pool_connections,
                pool_maxsize=self._config.pool_maxsize,
                max_retries=self._config.max_retries,
                pool_block=self._config.pool_block,
            )

            self._session.mount("http://", adapter)
            self._session.mount("https://", adapter)
            logger.debug("Created new HTTP session with connection pool")

    def get_session(self) -> Optional[requests.Session]:
        """
        获取 Session 对象

        Returns:
            如果启用了连接复用，返回全局 Session
            否则返回 None

        Examples:
            >>> manager = SessionManager.get_instance()
            >>> manager.enable()
            >>> session = manager.get_session()
            >>> if session:
            ...     response = session.get(url)
        """
        if not self._enabled:
            return None

        with self._session_lock:
            self._ensure_session()
            return self._session

    def reset(self):
        """重置 Session（用于处理连接问题）"""
        with self._session_lock:
            if self._session:
                try:
                    self._session.close()
                except Exception as e:
                    logger.warning("Error closing session during reset: %s", e)
                finally:
                    self._session = None
            if self._enabled:
                self._ensure_session()
            logger.info("HTTP connection pool reset")

    def configure(
        self,
        pool_connections: Optional[int] = None,
        pool_maxsize: Optional[int] = None,
        max_retries: Optional[int] = None,
        pool_block: Optional[bool] = None,
    ):
        """
        更新配置并重建 Session

        Args:
            pool_connections: 连接池大小
            pool_maxsize: 最大连接数
            max_retries: 重试次数
            pool_block: 连接池满时是否阻塞

        Examples:
            # 调整单个参数
            configure(pool_maxsize=100)

            # 调整多个参数
            configure(pool_connections=50, pool_maxsize=100)
        """
        with self._session_lock:
            # 使用命名参数更新配置
            if pool_connections is not None:
                self._config.pool_connections = pool_connections
            if pool_maxsize is not None:
                self._config.pool_maxsize = pool_maxsize
            if max_retries is not None:
                self._config.max_retries = max_retries
            if pool_block is not None:
                self._config.pool_block = pool_block

            # 参数验证
            if self._config.pool_maxsize < self._config.pool_connections:
                raise ValueError(
                    f"pool_maxsize ({self._config.pool_maxsize}) 必须 >= "
                    f"pool_connections ({self._config.pool_connections})",
                )

            if self._enabled:
                # 重建 Session 以应用新配置
                if self._session:
                    try:
                        self._session.close()
                    except Exception as e:
                        logger.warning(
                            "Error closing session during configure: %s",
                            e,
                        )
                    finally:
                        self._session = None
                self._ensure_session()
            logger.info("HTTP connection pool configured: %s", self._config)
