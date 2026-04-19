# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

from typing import Generator, List, Union, AsyncGenerator

from dashscope.api_entities.dashscope_response import (
    Message,
    DashScopeAPIResponse,
    ImageGenerationResponse,
)
from dashscope.client.base_api import (
    BaseAioApi,
    BaseApi,
    BaseAsyncApi,
    BaseAsyncAioApi,
)
from dashscope.common.error import InputRequired, ModelRequired
from dashscope.common.utils import _get_task_group_and_task
from dashscope.utils.oss_utils import preprocess_message_element
from dashscope.utils.param_utils import ParamUtil
from dashscope.utils.message_utils import merge_single_response


class ImageGeneration(BaseApi, BaseAsyncApi):
    sync_task = "multimodal-generation"
    async_task = "image-generation"
    function = "generation"
    """API for AI-Generated Content(AIGC) models.

    """

    class Models:
        wan2_6_image = "wan2.6-image"
        wan2_6_t2i = "wan2.6-t2i"

    @classmethod
    def call(  # type: ignore[override]
        cls,
        model: str,
        api_key: str = None,
        messages: List[Message] = None,
        workspace: str = None,
        **kwargs,
    ) -> Union[
        ImageGenerationResponse,
        Generator[ImageGenerationResponse, None, None],
    ]:
        """Call generation model service.

        Args:
            model (str): The requested model
            api_key (str, optional): The api api_key, can be None,
                if None, will get by default rule(TODO: api key doc).
            messages (list): The generation messages.
                examples:
                    [{'role': 'user',
                      'content': 'The weather is fine today.'},
                      {'role': 'assistant', 'content': 'Suitable for outings'}]
            **kwargs:
                stream(bool, `optional`): Enable server-sent events
                    (ref: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)  # noqa E501  # pylint: disable=line-too-long
                    the result will back partially[qwen-turbo,bailian-v1].
            workspace (str): The dashscope workspace id.
        Raises:
            InvalidInput: The history and auto_history are mutually exclusive.

        Returns:
            Union[ImageGenerationResponse,
                  Generator[ImageGenerationResponse, None, None]]: If
            stream is True, return Generator, otherwise ImageGenerationResponse.
        """
        if messages is None or not messages:
            raise InputRequired("messages is required!")
        if model is None or not model:
            raise ModelRequired("Model is required!")

        task_group, _ = _get_task_group_and_task(__name__)
        _input = {}

        if messages is not None and messages:
            has_upload = cls._preprocess_messages(model, messages, api_key)  # type: ignore[arg-type] # pylint: disable=line-too-long # noqa: E501
            if has_upload:
                headers = kwargs.pop("headers", {})
                headers["X-DashScope-OssResourceResolve"] = "enable"
                kwargs["headers"] = headers

        _input.update({"messages": messages})

        # Check if we need to merge incremental output
        is_incremental_output = kwargs.get("incremental_output", None)
        is_stream = kwargs.get("stream", False)
        to_merge_incremental_output = False
        if (
            ParamUtil.should_modify_incremental_output(model)
            and is_stream
            and is_incremental_output is not None
            and is_incremental_output is False
        ):
            to_merge_incremental_output = True
            kwargs["incremental_output"] = True

        # Pass incremental_to_full flag via headers user-agent
        if "headers" not in kwargs:
            kwargs["headers"] = {}

        flag = "1" if to_merge_incremental_output else "0"
        kwargs["headers"]["user-agent"] = f"incremental_to_full/{flag}"
        if kwargs.get("is_async", False):
            kwargs["headers"]["X-DashScope-Async"] = "enable"
            task = cls.async_task
        else:
            task = cls.sync_task

        response = super().call(
            model=model,
            task_group=task_group,
            task=task,
            function=ImageGeneration.function,
            api_key=api_key,
            input=_input,
            workspace=workspace,
            **kwargs,
        )
        if is_stream:
            if to_merge_incremental_output:
                # Extract n parameter for merge logic
                n = kwargs.get("n", 1)
                return cls._merge_generation_response(response, n)
            else:
                return (
                    ImageGenerationResponse.from_api_response(rsp)
                    for rsp in response
                )
        else:
            return ImageGenerationResponse.from_api_response(response)

    @classmethod
    def async_call(  # type: ignore[override]
        cls,
        model: str,
        api_key: str = None,
        messages: List[Message] = None,
        workspace: str = None,
        **kwargs,
    ) -> Union[
        ImageGenerationResponse,
        Generator[ImageGenerationResponse, None, None],
    ]:
        kwargs["is_async"] = True
        return cls.call(model, api_key, messages, workspace, **kwargs)

    @classmethod
    def fetch(
        cls,
        task: Union[str, ImageGenerationResponse],  # type: ignore[override]
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """Fetch image(s) synthesis task status or result.

        Args:
            task (Union[str, ImageGenerationResponse]): The task_id or
                ImageGenerationResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            DashScopeAPIResponse: The task status or result.
        """
        response = super().fetch(task, api_key=api_key, workspace=workspace)
        return ImageGenerationResponse.from_api_response(response)

    @classmethod
    def wait(
        cls,
        task: Union[str, ImageGenerationResponse],  # type: ignore[override]
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """Wait for image(s) synthesis task to complete, and return the result.

        Args:
            task (Union[str, ImageGenerationResponse]): The task_id or
                ImageGenerationResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            DashScopeAPIResponse: The task result.
        """
        response = super().wait(task, api_key, workspace=workspace)
        return ImageGenerationResponse.from_api_response(response)

    @classmethod
    def cancel(
        cls,
        task: Union[str, ImageGenerationResponse],  # type: ignore[override]
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """Cancel image synthesis task.
        Only tasks whose status is PENDING can be canceled.

        Args:
            task (Union[str, ImageGenerationResponse]): The task_id or
                ImageGenerationResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            DashScopeAPIResponse: The response data.
        """
        return super().cancel(task, api_key, workspace=workspace)

    @classmethod
    def list(
        cls,
        start_time: str = None,
        end_time: str = None,
        model_name: str = None,
        api_key_id: str = None,
        region: str = None,
        status: str = None,
        page_no: int = 1,
        page_size: int = 10,
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """List async tasks.

        Args:
            start_time (str, optional): The tasks start time,
                for example: 20230420000000. Defaults to None.
            end_time (str, optional): The tasks end time,
                for example: 20230420000000. Defaults to None.
            model_name (str, optional): The tasks model name. Defaults to None.
            api_key_id (str, optional): The tasks api-key-id. Defaults to None.
            region (str, optional): The service region,
                for example: cn-beijing. Defaults to None.
            status (str, optional): The status of tasks[PENDING,
                RUNNING, SUCCEEDED, FAILED, CANCELED]. Defaults to None.
            page_no (int, optional): The page number. Defaults to 1.
            page_size (int, optional): The page size. Defaults to 10.
            api_key (str, optional): The user api-key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            DashScopeAPIResponse: The response data.
        """
        return super().list(
            start_time=start_time,
            end_time=end_time,
            model_name=model_name,
            api_key_id=api_key_id,
            region=region,
            status=status,
            page_no=page_no,
            page_size=page_size,
            api_key=api_key,
            workspace=workspace,
            **kwargs,
        )

    @classmethod
    def _preprocess_messages(
        cls,
        model: str,
        messages: List[dict],
        api_key: str,
    ):
        """
        messages = [
            {
                "role": "user",
                "content": [
                    {"image": ""},
                    {"text": ""},
                ]
            }
        ]
        """
        has_upload = False
        upload_certificate = None

        for message in messages:
            if message.get("role", "") == "user":
                content = message["content"]
                for elem in content:
                    if not isinstance(
                        elem,
                        (int, float, bool, str, bytes, bytearray),
                    ):
                        (
                            is_upload,
                            upload_certificate,
                        ) = preprocess_message_element(
                            model,
                            elem,
                            api_key,
                            upload_certificate,  # type: ignore[arg-type]
                        )
                        if is_upload and not has_upload:
                            has_upload = True
        return has_upload

    @classmethod
    def _merge_generation_response(
        cls,
        response,
        n=1,
    ) -> Generator[ImageGenerationResponse, None, None]:
        """Merge incremental response chunks to simulate non-incremental output."""  # noqa: E501
        accumulated_data = {}
        for rsp in response:
            parsed_response = ImageGenerationResponse.from_api_response(rsp)
            result = merge_single_response(
                parsed_response,
                accumulated_data,
                n,
            )
            if result is True:
                yield parsed_response
            elif isinstance(result, list):
                # Multiple responses to yield (for n>1 non-stop cases)
                for resp in result:
                    yield resp


class AioImageGeneration(BaseAioApi, BaseAsyncAioApi):
    sync_task = "multimodal-generation"
    async_task = "image-generation"
    function = "generation"
    """API for AI-Generated Content(AIGC) models.

    """

    class Models:
        wan2_6_image = "wan2.6-image"
        wan2_6_t2i = "wan2.6-t2i"

    @classmethod
    async def call(  # type: ignore[override]
        cls,
        model: str,
        api_key: str = None,
        messages: List[Message] = None,
        workspace: str = None,
        **kwargs,
    ) -> Union[
        ImageGenerationResponse,
        AsyncGenerator[ImageGenerationResponse, None],
    ]:
        """Call generation model service.

        Args:
            model (str): The requested model
            api_key (str, optional): The api api_key, can be None,
                if None, will get by default rule(TODO: api key doc).
            messages (list): The generation messages.
                examples:
                    [{'role': 'user',
                      'content': 'The weather is fine today.'},
                      {'role': 'assistant', 'content': 'Suitable for outings'}]
            **kwargs:
                stream(bool, `optional`): Enable server-sent events
                    (ref: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)  # noqa E501  # pylint: disable=line-too-long
                    the result will back partially[qwen-turbo,bailian-v1].
            workspace (str): The dashscope workspace id.
        Raises:
            InvalidInput: The history and auto_history are mutually exclusive.

        Returns:
            Union[ImageGenerationResponse,
                  AsyncGenerator[ImageGenerationResponse, None]]: If
            stream is True, return AsyncGenerator, otherwise ImageGenerationResponse.
        """
        if messages is None or not messages:
            raise InputRequired("messages is required!")
        if model is None or not model:
            raise ModelRequired("Model is required!")

        task_group, _ = _get_task_group_and_task(__name__)
        _input = {}

        if messages is not None and messages:  # type: ignore
            has_upload = cls._preprocess_messages(model, messages, api_key)  # type: ignore[arg-type] # pylint: disable=line-too-long # noqa: E501
            if has_upload:
                headers = kwargs.pop("headers", {})
                headers["X-DashScope-OssResourceResolve"] = "enable"
                kwargs["headers"] = headers

        _input.update({"messages": messages})

        # Check if we need to merge incremental output
        is_incremental_output = kwargs.get("incremental_output", None)
        is_stream = kwargs.get("stream", False)
        to_merge_incremental_output = False
        if (
            ParamUtil.should_modify_incremental_output(model)
            and is_stream
            and is_incremental_output is not None
            and is_incremental_output is False
        ):
            to_merge_incremental_output = True
            kwargs["incremental_output"] = True

        # Pass incremental_to_full flag via headers user-agent
        if "headers" not in kwargs:
            kwargs["headers"] = {}

        flag = "1" if to_merge_incremental_output else "0"
        kwargs["headers"]["user-agent"] = f"incremental_to_full/{flag}"
        if kwargs.get("is_async", False):
            kwargs["headers"]["X-DashScope-Async"] = "enable"
            task = cls.async_task
        else:
            task = cls.sync_task

        response = await super().call(
            model=model,
            task_group=task_group,
            task=task,
            function=AioImageGeneration.function,
            api_key=api_key,
            input=_input,
            workspace=workspace,
            **kwargs,
        )
        if is_stream:
            if to_merge_incremental_output:
                # Extract n parameter for merge logic
                n = kwargs.get("n", 1)
                return cls._merge_generation_response(response, n)
            else:
                return cls._stream_responses(response)
        else:
            return ImageGenerationResponse.from_api_response(response)

    @classmethod
    async def async_call(  # type: ignore[override]
        cls,
        model: str,
        api_key: str = None,
        messages: List[Message] = None,
        workspace: str = None,
        **kwargs,
    ) -> Union[
        ImageGenerationResponse,
        AsyncGenerator[ImageGenerationResponse, None],
    ]:
        kwargs["is_async"] = True
        return await cls.call(model, api_key, messages, workspace, **kwargs)

    @classmethod
    async def fetch(
        cls,
        task: Union[str, ImageGenerationResponse],  # type: ignore[override]
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """Fetch image(s) synthesis task status or result.

        Args:
            task (Union[str, ImageGenerationResponse]): The task_id or
                ImageGenerationResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            DashScopeAPIResponse: The task status or result.
        """
        response = await super().fetch(
            task,
            api_key=api_key,
            workspace=workspace,
        )
        return ImageGenerationResponse.from_api_response(response)

    @classmethod
    async def wait(
        cls,
        task: Union[str, ImageGenerationResponse],  # type: ignore[override]
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """Wait for image(s) synthesis task to complete, and return the result.

        Args:
            task (Union[str, ImageGenerationResponse]): The task_id or
                ImageGenerationResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            DashScopeAPIResponse: The task result.
        """
        response = await super().wait(task, api_key, workspace=workspace)
        return ImageGenerationResponse.from_api_response(response)

    @classmethod
    async def cancel(
        cls,
        task: Union[str, ImageGenerationResponse],  # type: ignore[override]
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """Cancel image synthesis task.
        Only tasks whose status is PENDING can be canceled.

        Args:
            task (Union[str, ImageGenerationResponse]): The task_id or
                ImageGenerationResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            DashScopeAPIResponse: The response data.
        """
        return await super().cancel(task, api_key, workspace=workspace)

    @classmethod
    async def list(
        cls,
        start_time: str = None,
        end_time: str = None,
        model_name: str = None,
        api_key_id: str = None,
        region: str = None,
        status: str = None,
        page_no: int = 1,
        page_size: int = 10,
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """List async tasks.

        Args:
            start_time (str, optional): The tasks start time,
                for example: 20230420000000. Defaults to None.
            end_time (str, optional): The tasks end time,
                for example: 20230420000000. Defaults to None.
            model_name (str, optional): The tasks model name. Defaults to None.
            api_key_id (str, optional): The tasks api-key-id. Defaults to None.
            region (str, optional): The service region,
                for example: cn-beijing. Defaults to None.
            status (str, optional): The status of tasks[PENDING,
                RUNNING, SUCCEEDED, FAILED, CANCELED]. Defaults to None.
            page_no (int, optional): The page number. Defaults to 1.
            page_size (int, optional): The page size. Defaults to 10.
            api_key (str, optional): The user api-key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            DashScopeAPIResponse: The response data.
        """
        return await super().list(
            start_time=start_time,
            end_time=end_time,
            model_name=model_name,
            api_key_id=api_key_id,
            region=region,
            status=status,
            page_no=page_no,
            page_size=page_size,
            api_key=api_key,
            workspace=workspace,
            **kwargs,
        )

    @classmethod
    def _preprocess_messages(
        cls,
        model: str,
        messages: List[dict],
        api_key: str,
    ):
        """
        messages = [
            {
                "role": "user",
                "content": [
                    {"image": ""},
                    {"text": ""},
                ]
            }
        ]
        """
        has_upload = False
        upload_certificate = None

        for message in messages:
            if message.get("role", "") == "user":
                content = message["content"]
                for elem in content:
                    if not isinstance(
                        elem,
                        (int, float, bool, str, bytes, bytearray),
                    ):
                        (
                            is_upload,
                            upload_certificate,
                        ) = preprocess_message_element(
                            model,
                            elem,
                            api_key,
                            upload_certificate,  # type: ignore[arg-type]
                        )
                        if is_upload and not has_upload:
                            has_upload = True
        return has_upload

    @classmethod
    async def _stream_responses(
        cls,
        response,
    ) -> AsyncGenerator[ImageGenerationResponse, None]:
        """Convert async response stream to ImageGenerationResponse stream."""
        # Type hint: when stream=True, response is actually an AsyncIterable
        async for rsp in response:  # type: ignore
            yield ImageGenerationResponse.from_api_response(rsp)

    @classmethod
    async def _merge_generation_response(
        cls,
        response,
        n=1,
    ) -> AsyncGenerator[ImageGenerationResponse, None]:
        """Async version of merge incremental response chunks."""
        accumulated_data = {}

        async for rsp in response:  # type: ignore
            parsed_response = ImageGenerationResponse.from_api_response(rsp)
            result = merge_single_response(
                parsed_response,
                accumulated_data,
                n,
            )
            if result is True:
                yield parsed_response
            elif isinstance(result, list):
                # Multiple responses to yield (for n>1 non-stop cases)
                for resp in result:
                    yield resp
