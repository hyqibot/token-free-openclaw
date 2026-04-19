# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

from dashscope.api_entities.dashscope_response import DashScopeAPIResponse
from dashscope.client.base_api import GetMixin, ListMixin


class Model(ListMixin, GetMixin):
    SUB_PATH = "models"

    @classmethod
    def get(  # type: ignore[override]
        cls,
        name: str,
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """Get the model information.

        Args:
            name (str): The model name.
            api_key (str, optional): The api key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            DashScopeAPIResponse: The model information.
        """
        # type: ignore
        return super().get(  # type: ignore[return-value]
            name,
            api_key,
            workspace=workspace,
            **kwargs,
        )  # noqa: E501

    @classmethod
    def list(  # type: ignore[override]
        cls,
        page=1,
        page_size=10,
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """List models.

        Args:
            api_key (str, optional): The api key
            page (int, optional): Page number. Defaults to 1.
            page_size (int, optional): Items per page. Defaults to 10.

        Returns:
            DashScopeAPIResponse: The models.
        """
        return super().list(  # type: ignore[return-value]
            api_key,
            page,
            page_size,
            workspace=workspace,
            **kwargs,
        )
