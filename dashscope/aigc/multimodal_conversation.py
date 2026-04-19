# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

import copy
from typing import AsyncGenerator, Generator, List, Union

from dashscope.api_entities.dashscope_response import (
    MultiModalConversationResponse,
)
from dashscope.client.base_api import BaseAioApi, BaseApi
from dashscope.common.error import ModelRequired
from dashscope.common.utils import _get_task_group_and_task
from dashscope.utils.oss_utils import preprocess_message_element
from dashscope.utils.param_utils import ParamUtil
from dashscope.utils.message_utils import merge_multimodal_single_response


class MultiModalConversation(BaseApi):
    """MultiModal conversational robot interface."""

    task = "multimodal-generation"
    function = "generation"

    class Models:
        qwen_vl_chat_v1 = "qwen-vl-chat-v1"

    @classmethod
    # type: ignore
    def call(  # pylint: disable=arguments-renamed,too-many-branches
        cls,
        model: str,
        messages: List = None,
        api_key: str = None,
        workspace: str = None,
        text: str = None,
        voice: str = None,
        language_type: str = None,
        **kwargs,
    ) -> Union[
        MultiModalConversationResponse,
        Generator[
            MultiModalConversationResponse,
            None,
            None,
        ],
    ]:
        """Call the conversation model service.

        Args:
            model (str): The requested model, such as 'qwen-multimodal-v1'
            messages (list): The generation messages.
                examples:
                    [
                        {
                            "role": "system",
                            "content": [
                                {"text": "你是达摩院的生活助手机器人。"}
                            ]
                        },
                        {
                            "role": "user",
                            "content": [
                                {"image": "http://XXXX"},
                                {"text": "这个图片是哪里？"},
                            ]
                        }
                    ]
            api_key (str, optional): The api api_key, can be None,
                if None, will retrieve by rule [1].
                [1]: https://help.aliyun.com/zh/dashscope/developer-reference/api-key-settings. # noqa E501  # pylint: disable=line-too-long
            workspace (str): The dashscope workspace id.
            text (str): The text to generate.
            voice (str): The voice name of qwen tts, include 'Cherry'/'Ethan'/'Sunny'/'Dylan' and so on,  # pylint: disable=line-too-long
                    you can get the total voice list : https://help.aliyun.com/zh/model-studio/qwen-tts.  # pylint: disable=line-too-long
            language_type (str): The synthesized language type, default is 'auto', useful for [qwen3-tts].  # pylint: disable=line-too-long
            **kwargs:
                stream(bool, `optional`): Enable server-sent events
                    (ref: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)  # noqa E501  # pylint: disable=line-too-long
                    the result will back partially[qwen-turbo,bailian-v1].
                max_length(int, `optional`): The maximum length of tokens to
                    generate. The token count of your prompt plus max_length
                    cannot exceed the model's context length. Most models
                    have a context length of 2000 tokens[qwen-turbo,bailian-v1]. # noqa E501
                top_p(float, `optional`): A sampling strategy, called nucleus
                    sampling, where the model considers the results of the
                    tokens with top_p probability mass. So 0.1 means only
                    the tokens comprising the top 10% probability mass are
                    considered[qwen-turbo,bailian-v1].
                top_k(float, `optional`):


        Raises:
            InvalidInput: The history and auto_history are mutually exclusive.

        Returns:
            Union[MultiModalConversationResponse,
                  Generator[MultiModalConversationResponse, None, None]]: If
            stream is True, return Generator, otherwise MultiModalConversationResponse.
        """
        if model is None or not model:
            raise ModelRequired("Model is required!")
        task_group, _ = _get_task_group_and_task(__name__)
        input = {}  # pylint: disable=redefined-builtin
        msg_copy = None

        if messages is not None and messages:
            msg_copy = copy.deepcopy(messages)
            has_upload = cls._preprocess_messages(model, msg_copy, api_key)
            if has_upload:
                headers = kwargs.pop("headers", {})
                headers["X-DashScope-OssResourceResolve"] = "enable"
                kwargs["headers"] = headers

        if text is not None and text:
            input.update({"text": text})
        if voice is not None and voice:
            input.update({"voice": voice})
        if language_type is not None and language_type:
            input.update({"language_type": language_type})
        if msg_copy is not None:
            input.update({"messages": msg_copy})  # type: ignore

        # Check if we need to merge incremental output
        is_incremental_output = kwargs.get("incremental_output", None)
        to_merge_incremental_output = False
        is_stream = kwargs.get("stream", False)
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

        response = super().call(
            model=model,
            task_group=task_group,
            task=MultiModalConversation.task,
            function=MultiModalConversation.function,
            api_key=api_key,
            input=input,
            workspace=workspace,
            **kwargs,
        )
        if is_stream:
            if to_merge_incremental_output:
                # Extract n parameter for merge logic
                n = kwargs.get("n", 1)
                return cls._merge_multimodal_response(response, n)
            else:
                return (
                    MultiModalConversationResponse.from_api_response(rsp)
                    for rsp in response
                )
        else:
            return MultiModalConversationResponse.from_api_response(response)

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
    def _merge_multimodal_response(
        cls,
        response,
        n=1,
    ) -> Generator[MultiModalConversationResponse, None, None]:
        """Merge incremental response chunks to simulate non-incremental output."""  # noqa: E501
        accumulated_data = {}

        for rsp in response:
            parsed_response = MultiModalConversationResponse.from_api_response(
                rsp,
            )
            result = merge_multimodal_single_response(
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


class AioMultiModalConversation(BaseAioApi):
    """Async MultiModal conversational robot interface."""

    task = "multimodal-generation"
    function = "generation"

    class Models:
        qwen_vl_chat_v1 = "qwen-vl-chat-v1"

    @classmethod  # type: ignore
    async def call(  # pylint: disable=arguments-renamed,too-many-branches
        cls,
        model: str,
        messages: List = None,
        api_key: str = None,
        workspace: str = None,
        text: str = None,
        voice: str = None,
        language_type: str = None,
        **kwargs,
    ) -> Union[
        MultiModalConversationResponse,
        AsyncGenerator[
            MultiModalConversationResponse,
            None,
        ],
    ]:
        """Call the conversation model service asynchronously.

        Args:
            model (str): The requested model, such as 'qwen-multimodal-v1'
            messages (list): The generation messages.
                examples:
                    [
                        {
                            "role": "system",
                            "content": [
                                {"text": "你是达摩院的生活助手机器人。"}
                            ]
                        },
                        {
                            "role": "user",
                            "content": [
                                {"image": "http://XXXX"},
                                {"text": "这个图片是哪里？"},
                            ]
                        }
                    ]
            api_key (str, optional): The api api_key, can be None,
                if None, will retrieve by rule [1].
                [1]: https://help.aliyun.com/zh/dashscope/developer-reference/api-key-settings. # noqa E501  # pylint: disable=line-too-long
            workspace (str): The dashscope workspace id.
            text (str): The text to generate.
            voice (str): The voice name of qwen tts, include 'Cherry'/'Ethan'/'Sunny'/'Dylan' and so on,  # pylint: disable=line-too-long
                    you can get the total voice list : https://help.aliyun.com/zh/model-studio/qwen-tts.  # pylint: disable=line-too-long
            language_type (str): The synthesized language type, default is 'auto', useful for [qwen3-tts].  # pylint: disable=line-too-long
            **kwargs:
                stream(bool, `optional`): Enable server-sent events
                    (ref: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)  # noqa E501  # pylint: disable=line-too-long
                    the result will back partially[qwen-turbo,bailian-v1].
                max_length(int, `optional`): The maximum length of tokens to
                    generate. The token count of your prompt plus max_length
                    cannot exceed the model's context length. Most models
                    have a context length of 2000 tokens[qwen-turbo,bailian-v1]. # noqa E501
                top_p(float, `optional`): A sampling strategy, called nucleus
                    sampling, where the model considers the results of the
                    tokens with top_p probability mass. So 0.1 means only
                    the tokens comprising the top 10% probability mass are
                    considered[qwen-turbo,bailian-v1].
                top_k(float, `optional`):

        Raises:
            InvalidInput: The history and auto_history are mutually exclusive.

        Returns:
            Union[MultiModalConversationResponse,
                  AsyncGenerator[MultiModalConversationResponse, None]]: If
            stream is True, return AsyncGenerator, otherwise MultiModalConversationResponse.
        """
        if model is None or not model:
            raise ModelRequired("Model is required!")
        task_group, _ = _get_task_group_and_task(__name__)
        input = {}  # pylint: disable=redefined-builtin
        msg_copy = None

        if messages is not None and messages:
            msg_copy = copy.deepcopy(messages)
            has_upload = cls._preprocess_messages(model, msg_copy, api_key)
            if has_upload:
                headers = kwargs.pop("headers", {})
                headers["X-DashScope-OssResourceResolve"] = "enable"
                kwargs["headers"] = headers

        if text is not None and text:
            input.update({"text": text})
        if voice is not None and voice:
            input.update({"voice": voice})
        if language_type is not None and language_type:
            input.update({"language_type": language_type})
        if msg_copy is not None:
            input.update({"messages": msg_copy})  # type: ignore

        # Check if we need to merge incremental output
        is_incremental_output = kwargs.get("incremental_output", None)
        to_merge_incremental_output = False
        is_stream = kwargs.get("stream", False)
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
        kwargs["headers"]["user-agent"] = (
            kwargs["headers"].get("user-agent", "")
            + f"; incremental_to_full/{flag}"
        )

        response = await super().call(
            model=model,
            task_group=task_group,
            task=AioMultiModalConversation.task,
            function=AioMultiModalConversation.function,
            api_key=api_key,
            input=input,
            workspace=workspace,
            **kwargs,
        )
        if is_stream:
            if to_merge_incremental_output:
                # Extract n parameter for merge logic
                n = kwargs.get("n", 1)
                return cls._merge_multimodal_response(response, n)
            else:
                return cls._stream_responses(response)
        else:
            return MultiModalConversationResponse.from_api_response(response)

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
    ) -> AsyncGenerator[MultiModalConversationResponse, None]:
        """Convert async response stream to MultiModalConversationResponse stream."""  # noqa: E501
        # Type hint: when stream=True, response is actually an AsyncIterable
        async for rsp in response:  # type: ignore
            yield MultiModalConversationResponse.from_api_response(rsp)

    @classmethod
    async def _merge_multimodal_response(
        cls,
        response,
        n=1,
    ) -> AsyncGenerator[MultiModalConversationResponse, None]:
        """Async version of merge incremental response chunks."""
        accumulated_data = {}

        async for rsp in response:
            parsed_response = MultiModalConversationResponse.from_api_response(
                rsp,
            )
            result = merge_multimodal_single_response(
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
