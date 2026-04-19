# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

from typing import Any, Dict, Union, List

from concurrent.futures import ThreadPoolExecutor, as_completed

from dashscope.api_entities.dashscope_response import (
    DashScopeAPIResponse,
    VideoSynthesisResponse,
)
from dashscope.client.base_api import BaseAsyncApi, BaseAsyncAioApi
from dashscope.common.constants import (
    PROMPT,
    REFERENCE_VIDEO_URLS,
    REFERENCE_URLS,
    MEDIA_URLS,
)
from dashscope.common.utils import _get_task_group_and_task
from dashscope.utils.oss_utils import check_and_upload_local


class VideoSynthesis(BaseAsyncApi):
    task = "video-generation"
    """API for video synthesis.
    """

    class Models:
        """@deprecated, use wanx2.1-t2v-plus instead"""

        wanx_txt2video_pro = "wanx-txt2video-pro"
        """@deprecated, use wanx2.1-i2v-plus instead"""
        wanx_img2video_pro = "wanx-img2video-pro"

        wanx_2_1_t2v_turbo = "wanx2.1-t2v-turbo"
        wanx_2_1_t2v_plus = "wanx2.1-t2v-plus"

        wanx_2_1_i2v_plus = "wanx2.1-i2v-plus"
        wanx_2_1_i2v_turbo = "wanx2.1-i2v-turbo"

        wanx_2_1_kf2v_plus = "wanx2.1-kf2v-plus"
        wanx_kf2v = "wanx-kf2v"

    class MediaType:
        FIRST_FRAME = "first_frame"
        LAST_FRAME = "last_frame"
        REFERENCE_IMAGE = "reference_image"
        REFERENCE_VIDEO = "reference_video"
        REFERENCE_VOICE = "reference_voice"
        VIDEO = "video"
        FIRST_CLIP = "first_clip"
        DRIVING_AUDIO = "driving_audio"

    @classmethod
    def call(  # type: ignore[override]
        cls,
        model: str,
        prompt: Any = None,
        # """@deprecated, use prompt_extend in parameters """
        extend_prompt: bool = True,
        negative_prompt: str = None,
        template: str = None,
        img_url: str = None,
        audio_url: str = None,
        reference_video_urls: List[str] = None,
        reference_urls: List[str] = None,
        reference_url: str = None,
        reference_video_description: List[str] = None,
        api_key: str = None,
        extra_input: Dict = None,
        workspace: str = None,
        task: str = None,
        head_frame: str = None,
        tail_frame: str = None,
        first_frame_url: str = None,
        last_frame_url: str = None,
        media: List[Dict] = None,
        **kwargs,
    ) -> VideoSynthesisResponse:
        """Call video synthesis service and get result.

        Args:
            model (str): The model, reference ``Models``.
            prompt (Any): The prompt for video synthesis.
            extend_prompt (bool): @deprecated, use prompt_extend in parameters
            negative_prompt (str): The negative prompt is the opposite of the prompt meaning.
            template (str): LoRa input, such as gufeng, katong, etc.
            img_url (str): The input image url, Generate the URL of the image referenced by the video.  # pylint: disable=line-too-long
            audio_url (str): The input audio url
            reference_video_urls (List[str]): list of character reference video file urls uploaded by the user  # pylint: disable=line-too-long
            reference_urls (List[str]): list of character reference file urls uploaded by the user  # pylint: disable=line-too-long
            reference_url str: reference file url uploaded by the user  # pylint: disable=line-too-long
            reference_video_description (List[str]): For the description information of the picture and sound of the reference video, corresponding to ref video, it needs to be in the order of the url. If the quantity is different, an error will be reported  # pylint: disable=line-too-long
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.
            extra_input (Dict): The extra input parameters.
            task (str): The task of api, ref doc.
            head_frame (str): The URL of the first frame image for generating the video.
            tail_frame (str): The URL of the last frame image for generating the video.
            first_frame_url (str): The URL of the first frame image for generating the video.
            last_frame_url (str): The URL of the last frame image for generating the video.
            media (list): media file list
            **kwargs:
                size(str, `optional`): The output video size(width*height).
                duration(
                    int,
                    optional
                ): The duration. Duration of video generation. The default value is 5, in seconds.  # noqa: E501
                seed(int, optional): The seed. The random seed for video generation. The default value is 5.  # noqa: E501  # pylint: disable=line-too-long

        Raises:
            InputRequired: The prompt cannot be empty.

        Returns:
            VideoSynthesisResponse: The video synthesis result.
        """
        return super().call(  # type: ignore[return-value]
            model,
            prompt,
            img_url=img_url,
            audio_url=audio_url,
            reference_video_urls=reference_video_urls,
            reference_urls=reference_urls,
            reference_url=reference_url,
            reference_video_description=reference_video_description,
            api_key=api_key,
            extend_prompt=extend_prompt,
            negative_prompt=negative_prompt,
            template=template,
            workspace=workspace,
            extra_input=extra_input,
            task=task,
            head_frame=head_frame,
            tail_frame=tail_frame,
            first_frame_url=first_frame_url,
            last_frame_url=last_frame_url,
            media=media,
            **kwargs,
        )

    @classmethod
    # pylint: disable=too-many-statements
    def _get_input(  # pylint: disable=too-many-branches
        cls,
        model: str,
        prompt: Any = None,
        img_url: str = None,
        audio_url: str = None,
        reference_video_urls: List[str] = None,
        reference_urls: List[str] = None,
        reference_url: str = None,
        reference_video_description: List[str] = None,
        # """@deprecated, use prompt_extend in parameters """
        extend_prompt: bool = True,
        negative_prompt: str = None,
        template: str = None,
        api_key: str = None,
        extra_input: Dict = None,
        task: str = None,
        function: str = None,
        head_frame: str = None,
        tail_frame: str = None,
        first_frame_url: str = None,
        last_frame_url: str = None,
        media: List[Dict] = None,
        **kwargs,
    ):
        inputs = {PROMPT: prompt, "extend_prompt": extend_prompt}
        if negative_prompt:
            inputs["negative_prompt"] = negative_prompt
        if template:
            inputs["template"] = template
        if function:
            inputs["function"] = function
        if reference_video_description:
            inputs["reference_video_description"] = reference_video_description

        has_upload = False
        upload_certificate = None

        tasks: List[Dict] = []

        single_params = {
            "img_url": img_url,
            "audio_url": audio_url,
            "head_frame": head_frame,
            "tail_frame": tail_frame,
            "first_frame_url": first_frame_url,
            "last_frame_url": last_frame_url,
            "reference_url": reference_url,
        }

        for key, url in single_params.items():
            if url is not None and url:
                tasks.append(
                    {
                        "type": "single",
                        "key": key,
                        "url": url,
                    },
                )

        if reference_video_urls:
            for idx, url in enumerate(reference_video_urls):
                if url:
                    tasks.append(
                        {
                            "type": "list_ref_video",
                            "index": idx,
                            "url": url,
                        },
                    )

        if reference_urls:
            for idx, url in enumerate(reference_urls):
                if url:
                    tasks.append(
                        {
                            "type": "list_ref_file",
                            "index": idx,
                            "url": url,
                        },
                    )

        if media:
            for i, m_file in enumerate(media):
                if isinstance(m_file, dict):
                    if m_file.get("url"):
                        tasks.append(
                            {
                                "type": "media",
                                "index": i,
                                "field": "url",
                                "url": m_file["url"],
                            },
                        )
                    if m_file.get("reference_voice"):
                        tasks.append(
                            {
                                "type": "media",
                                "index": i,
                                "field": "reference_voice",
                                "url": m_file["reference_voice"],
                            },
                        )

        def upload_worker(task_item, current_cert):
            url = task_item["url"]
            is_up, res_url, cert = check_and_upload_local(
                model,
                url,
                api_key,
                current_cert,
            )
            return task_item, is_up, res_url, cert

        results = []

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [
                executor.submit(upload_worker, t, upload_certificate)
                for t in tasks
            ]

            for future in as_completed(futures):
                task_item, is_up, res_url, cert = future.result()

                results.append(
                    {
                        "task": task_item,
                        "is_upload": is_up,
                        "new_url": res_url,
                        "cert": cert,
                    },
                )

        for res in results:
            if res["is_upload"]:
                has_upload = True

            new_url = res["new_url"]
            task_info = res["task"]
            t_type = task_info["type"]

            if t_type == "single":
                inputs[task_info["key"]] = new_url

            elif t_type == "list_ref_video":
                if REFERENCE_VIDEO_URLS not in inputs:
                    inputs[REFERENCE_VIDEO_URLS] = (
                        list(reference_video_urls)
                        if reference_video_urls
                        else []
                    )

                inputs[REFERENCE_VIDEO_URLS][task_info["index"]] = new_url

            elif t_type == "list_ref_file":
                if REFERENCE_URLS not in inputs:
                    inputs[REFERENCE_URLS] = (
                        list(reference_urls) if reference_urls else []
                    )
                inputs[REFERENCE_URLS][task_info["index"]] = new_url

            elif t_type == "media":
                if MEDIA_URLS not in inputs:
                    inputs[MEDIA_URLS] = media

                idx = task_info["index"]
                field = task_info["field"]
                if idx < len(inputs[MEDIA_URLS]):
                    inputs[MEDIA_URLS][idx][field] = new_url

        if extra_input is not None and extra_input:
            inputs = {**inputs, **extra_input}
        if has_upload:
            headers = kwargs.pop("headers", {})
            headers["X-DashScope-OssResourceResolve"] = "enable"
            kwargs["headers"] = headers

        if task is None:
            task = VideoSynthesis.task
        if model is not None and model and "kf2v" in model:
            task = "image2video"

        return inputs, kwargs, task

    @classmethod
    # type: ignore[override]
    def async_call(  # pylint: disable=arguments-renamed  # type: ignore[override] # noqa: E501
        cls,
        model: str,
        prompt: Any = None,
        img_url: str = None,
        audio_url: str = None,
        reference_video_urls: List[str] = None,
        reference_urls: List[str] = None,
        reference_url: str = None,
        reference_video_description: List[str] = None,
        # """@deprecated, use prompt_extend in parameters """
        extend_prompt: bool = True,
        negative_prompt: str = None,
        template: str = None,
        api_key: str = None,
        extra_input: Dict = None,
        workspace: str = None,
        task: str = None,
        head_frame: str = None,
        tail_frame: str = None,
        first_frame_url: str = None,
        last_frame_url: str = None,
        media: List[Dict] = None,
        **kwargs,
    ) -> VideoSynthesisResponse:
        """Create a video synthesis task, and return task information.

        Args:
            model (str): The model, reference ``Models``.
            prompt (Any): The prompt for video synthesis.
            extend_prompt (bool): @deprecated, use prompt_extend in parameters
            negative_prompt (str): The negative prompt is the opposite of the prompt meaning.
            template (str): LoRa input, such as gufeng, katong, etc.
            img_url (str): The input image url, Generate the URL of the image referenced by the video.  # pylint: disable=line-too-long
            audio_url (str): The input audio url.
            reference_video_urls (List[str]): list of character reference video file urls uploaded by the user  # pylint: disable=line-too-long
            reference_urls (List[str]): list of character reference file urls uploaded by the user  # pylint: disable=line-too-long
            reference_url (str): reference file url uploaded by the user  # pylint: disable=line-too-long
            reference_video_description (List[str]): For the description information of the picture and sound of the reference video, corresponding to ref video, it needs to be in the order of the url. If the quantity is different, an error will be reported  # pylint: disable=line-too-long
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.
            extra_input (Dict): The extra input parameters.
            task (str): The task of api, ref doc.
            head_frame (str): The URL of the first frame image for generating the video.
            tail_frame (str): The URL of the last frame image for generating the video.
            first_frame_url (str): The URL of the first frame image for generating the video.
            last_frame_url (str): The URL of the last frame image for generating the video.
            media (list): media file list
            **kwargs:
                size(str, `optional`): The output video size(width*height).
                duration(
                    int,
                    optional
                ): The duration. Duration of video generation. The default value is 5, in seconds.  # noqa: E501
                seed(int, optional): The seed. The random seed for video generation. The default value is 5.  # noqa: E501  # pylint: disable=line-too-long

        Raises:
            InputRequired: The prompt cannot be empty.

        Returns:
            DashScopeAPIResponse: The video synthesis
                task id in the response.
        """
        task_group, function = _get_task_group_and_task(__name__)

        inputs, kwargs, task = cls._get_input(
            model,
            prompt,
            img_url,
            audio_url,
            reference_video_urls,
            reference_urls,
            reference_url,
            reference_video_description,
            extend_prompt,
            negative_prompt,
            template,
            api_key,
            extra_input,
            task,
            function,
            head_frame,
            tail_frame,
            first_frame_url,
            last_frame_url,
            media,
            **kwargs,
        )

        response = super().async_call(
            model=model,
            task_group=task_group,
            task=VideoSynthesis.task if task is None else task,
            function=function,
            api_key=api_key,
            input=inputs,
            workspace=workspace,
            **kwargs,
        )
        return VideoSynthesisResponse.from_api_response(response)

    @classmethod
    def fetch(  # type: ignore[override]
        cls,
        task: Union[str, VideoSynthesisResponse],
        api_key: str = None,
        workspace: str = None,
    ) -> VideoSynthesisResponse:
        """Fetch video synthesis task status or result.

        Args:
            task (Union[str, VideoSynthesisResponse]): The task_id or
                VideoSynthesisResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            VideoSynthesisResponse: The task status or result.
        """
        response = super().fetch(task, api_key=api_key, workspace=workspace)
        return VideoSynthesisResponse.from_api_response(response)

    @classmethod
    def wait(  # type: ignore[override]
        cls,
        task: Union[str, VideoSynthesisResponse],
        api_key: str = None,
        workspace: str = None,
    ) -> VideoSynthesisResponse:
        """Wait for video synthesis task to complete, and return the result.

        Args:
            task (Union[str, VideoSynthesisResponse]): The task_id or
                VideoSynthesisResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            VideoSynthesisResponse: The task result.
        """
        response = super().wait(task, api_key, workspace=workspace)
        return VideoSynthesisResponse.from_api_response(response)

    @classmethod
    def cancel(  # type: ignore[override]
        cls,
        task: Union[str, VideoSynthesisResponse],
        api_key: str = None,
        workspace: str = None,
    ) -> DashScopeAPIResponse:
        """Cancel video synthesis task.
        Only tasks whose status is PENDING can be canceled.

        Args:
            task (Union[str, VideoSynthesisResponse]): The task_id or
                VideoSynthesisResponse return by async_call().
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


class AioVideoSynthesis(BaseAsyncAioApi):
    # type: ignore[override]
    @classmethod
    async def call(  # type: ignore[override] # pylint: disable=arguments-renamed  # noqa: E501
        # type: ignore[override]
        cls,
        model: str,
        prompt: Any = None,
        img_url: str = None,
        audio_url: str = None,
        reference_video_urls: List[str] = None,
        reference_urls: List[str] = None,
        reference_url: str = None,
        reference_video_description: List[str] = None,
        # """@deprecated, use prompt_extend in parameters """
        extend_prompt: bool = True,
        negative_prompt: str = None,
        template: str = None,
        api_key: str = None,
        extra_input: Dict = None,
        workspace: str = None,
        task: str = None,
        head_frame: str = None,
        tail_frame: str = None,
        first_frame_url: str = None,
        last_frame_url: str = None,
        media: List[Dict] = None,
        **kwargs,
    ) -> VideoSynthesisResponse:
        """Call video synthesis service and get result.

        Args:
            model (str): The model, reference ``Models``.
            prompt (Any): The prompt for video synthesis.
            extend_prompt (bool): @deprecated, use prompt_extend in parameters
            negative_prompt (str): The negative prompt is the opposite of the prompt meaning.
            template (str): LoRa input, such as gufeng, katong, etc.
            img_url (str): The input image url, Generate the URL of the image referenced by the video.  # pylint: disable=line-too-long
            audio_url (str): The input audio url.
            reference_video_urls (List[str]): list of character reference video file urls uploaded by the user  # pylint: disable=line-too-long
            reference_urls (List[str]): list of character reference file urls uploaded by the user  # pylint: disable=line-too-long
            reference_url (str): reference file url uploaded by the user  # pylint: disable=line-too-long
            reference_video_description (List[str]): For the description information of the picture and sound of the reference video, corresponding to ref video, it needs to be in the order of the url. If the quantity is different, an error will be reported  # pylint: disable=line-too-long
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.
            extra_input (Dict): The extra input parameters.
            task (str): The task of api, ref doc.
            head_frame (str): The URL of the first frame image for generating the video.
            tail_frame (str): The URL of the last frame image for generating the video.
            first_frame_url (str): The URL of the first frame image for generating the video.
            last_frame_url (str): The URL of the last frame image for generating the video.
            media (list): media file list
            **kwargs:
                size(str, `optional`): The output video size(width*height).
                duration(
                    int,
                    optional
                ): The duration. Duration of video generation. The default value is 5, in seconds.  # noqa: E501
                seed(int, optional): The seed. The random seed for video generation. The default value is 5.  # noqa: E501  # pylint: disable=line-too-long

        Raises:
            InputRequired: The prompt cannot be empty.

        Returns:
            VideoSynthesisResponse: The video synthesis result.
        """
        task_group, f = _get_task_group_and_task(__name__)
        # pylint: disable=protected-access
        inputs, kwargs, task = VideoSynthesis._get_input(
            model,
            # pylint: disable=protected-access
            prompt,
            img_url,
            audio_url,
            reference_video_urls,
            reference_urls,
            reference_url,
            reference_video_description,
            extend_prompt,
            negative_prompt,
            template,
            api_key,
            extra_input,
            task,
            f,
            head_frame,
            tail_frame,
            first_frame_url,
            last_frame_url,
            media,
            **kwargs,
        )
        response = await super().call(
            model,
            inputs,
            task_group,
            task,
            f,
            api_key,
            workspace,
            **kwargs,
        )
        return VideoSynthesisResponse.from_api_response(response)

    # type: ignore[override]

    @classmethod
    async def async_call(  # type: ignore[override] # pylint: disable=arguments-renamed # noqa: E501
        cls,
        model: str,
        prompt: Any = None,
        img_url: str = None,
        audio_url: str = None,
        reference_video_urls: List[str] = None,
        reference_urls: List[str] = None,
        reference_url: str = None,
        reference_video_description: List[str] = None,
        # """@deprecated, use prompt_extend in parameters """
        extend_prompt: bool = True,
        negative_prompt: str = None,
        template: str = None,
        api_key: str = None,
        extra_input: Dict = None,
        workspace: str = None,
        task: str = None,
        head_frame: str = None,
        tail_frame: str = None,
        first_frame_url: str = None,
        last_frame_url: str = None,
        media: List[Dict] = None,
        **kwargs,
    ) -> VideoSynthesisResponse:
        """Create a video synthesis task, and return task information.

        Args:
            model (str): The model, reference ``Models``.
            prompt (Any): The prompt for video synthesis.
            extend_prompt (bool): @deprecated, use prompt_extend in parameters
            negative_prompt (str): The negative prompt is the opposite of the prompt meaning.
            template (str): LoRa input, such as gufeng, katong, etc.
            img_url (str): The input image url, Generate the URL of the image referenced by the video.  # pylint: disable=line-too-long
            audio_url (str): The input audio url.
            reference_video_urls (List[str]): list of character reference video file urls uploaded by the user  # pylint: disable=line-too-long
            reference_urls (List[str]): list of character reference file urls uploaded by the user  # pylint: disable=line-too-long
            reference_url (str): reference file url uploaded by the user  # pylint: disable=line-too-long
            reference_video_description (List[str]): For the description information of the picture and sound of the reference video, corresponding to ref video, it needs to be in the order of the url. If the quantity is different, an error will be reported  # pylint: disable=line-too-long
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.
            extra_input (Dict): The extra input parameters.
            task (str): The task of api, ref doc.
            head_frame (str): The URL of the first frame image for generating the video.
            tail_frame (str): The URL of the last frame image for generating the video.
            first_frame_url (str): The URL of the first frame image for generating the video.
            last_frame_url (str): The URL of the last frame image for generating the video.
            media (list): media file list
            **kwargs:
                size(str, `optional`): The output video size(width*height).
                duration(
                    int,
                    optional
                ): The duration. Duration of video generation. The default value is 5, in seconds.  # noqa: E501
                seed(int, optional): The seed. The random seed for video generation. The default value is 5.  # noqa: E501  # pylint: disable=line-too-long

        Raises:
            InputRequired: The prompt cannot be empty.

        Returns:
            DashScopeAPIResponse: The video synthesis
                task id in the response.
        """
        task_group, function = _get_task_group_and_task(__name__)

        # pylint: disable=protected-access
        inputs, kwargs, task = VideoSynthesis._get_input(
            model,
            # pylint: disable=protected-access
            prompt,
            img_url,
            audio_url,
            reference_video_urls,
            reference_urls,
            reference_url,
            reference_video_description,
            extend_prompt,
            negative_prompt,
            template,
            api_key,
            extra_input,
            task,
            function,
            head_frame,
            tail_frame,
            first_frame_url,
            last_frame_url,
            media,
            **kwargs,
        )

        response = await super().async_call(
            model=model,
            task_group=task_group,
            task=VideoSynthesis.task if task is None else task,
            function=function,
            api_key=api_key,
            input=inputs,
            workspace=workspace,
            **kwargs,
        )
        return VideoSynthesisResponse.from_api_response(response)

    @classmethod
    async def fetch(
        cls,
        task: Union[str, VideoSynthesisResponse],  # type: ignore[override]
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> VideoSynthesisResponse:
        """Fetch video synthesis task status or result.

        Args:
            task (Union[str, VideoSynthesisResponse]): The task_id or
                VideoSynthesisResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            VideoSynthesisResponse: The task status or result.
        """
        response = await super().fetch(
            task,
            api_key=api_key,
            workspace=workspace,
        )
        return VideoSynthesisResponse.from_api_response(response)

    @classmethod
    async def wait(
        cls,
        task: Union[str, VideoSynthesisResponse],  # type: ignore[override]
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> VideoSynthesisResponse:
        """Wait for video synthesis task to complete, and return the result.

        Args:
            task (Union[str, VideoSynthesisResponse]): The task_id or
                VideoSynthesisResponse return by async_call().
            api_key (str, optional): The api api_key. Defaults to None.
            workspace (str): The dashscope workspace id.

        Returns:
            VideoSynthesisResponse: The task result.
        """
        response = await super().wait(task, api_key, workspace=workspace)
        return VideoSynthesisResponse.from_api_response(response)

    @classmethod
    async def cancel(
        cls,
        task: Union[str, VideoSynthesisResponse],  # type: ignore[override]
        api_key: str = None,
        workspace: str = None,
        **kwargs,
    ) -> DashScopeAPIResponse:
        """Cancel video synthesis task.
        Only tasks whose status is PENDING can be canceled.

        Args:
            task (Union[str, VideoSynthesisResponse]): The task_id or
                VideoSynthesisResponse return by async_call().
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
