# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

import os
from abc import ABC, abstractmethod

from dashscope.common.constants import DASHSCOPE_DISABLE_DATA_INSPECTION_ENV
from dashscope.common.utils import get_user_agent


class BaseRequest(ABC):
    def __init__(self, user_agent: str = "") -> None:
        ua = get_user_agent()

        # Append user_agent if provided and not empty
        if user_agent:
            ua += "; " + user_agent

        self.headers = {"user-agent": ua}
        disable_data_inspection = os.environ.get(
            DASHSCOPE_DISABLE_DATA_INSPECTION_ENV,
            "true",
        )

        if disable_data_inspection.lower() == "false":
            self.headers["X-DashScope-DataInspection"] = "enable"

    @abstractmethod
    def call(self):
        raise NotImplementedError()


class AioBaseRequest(BaseRequest):
    @abstractmethod
    async def aio_call(self):
        raise NotImplementedError()
