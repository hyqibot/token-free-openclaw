# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

import json
import threading
import time
import uuid
from dataclasses import dataclass, field
from queue import Queue
import dashscope
from dashscope.client.base_api import BaseApi
from dashscope.common.error import InvalidParameter, ModelRequired
import websocket  # pylint: disable=wrong-import-order

# pylint: disable=ungrouped-imports
from dashscope.common.logging import logger
from dashscope.common.utils import get_user_agent
from dashscope.protocol.websocket import ActionType


class TingWuRealtimeCallback:
    """An interface that defines callback methods for getting TingWu results.
    Derive from this class and implement its function to provide your own data.
    """

    def on_open(self) -> None:
        pass

    def on_started(self, task_id: str) -> None:
        pass

    def on_speech_listen(self, result: dict):
        pass

    def on_recognize_result(self, result: dict):
        pass

    def on_ai_result(self, result: dict):
        pass

    def on_stopped(self) -> None:
        pass

    def on_error(self, error_code: str, error_msg: str) -> None:
        pass

    def on_close(self, close_status_code, close_msg):
        """
        callback when websocket connection is closed

        :param close_status_code
        :param close_msg
        """


class TingWuRealtime(BaseApi):
    """TingWuRealtime interface.

    Args:
        model (str): The requested model_id.
        callback (TingWuRealtimeCallback): A callback that returns
            speech recognition results.
        app_id (str): The dashscope tingwu app id.
        format (str): The input audio format for TingWu request.
        sample_rate (int): The input audio sample rate.
        terminology (str): The correct instruction set id.
        workspace (str): The dashscope workspace id.

        **kwargs:
            max_end_silence (int): The maximum end silence time.
            other_params (dict, `optional`): Other parameters.

    Raises:
        InputRequired: Input is required.
    """

    SILENCE_TIMEOUT_S = 60

    def __init__(
        self,
        model: str,
        callback: TingWuRealtimeCallback,
        audio_format: str = "pcm",
        sample_rate: int = 16000,
        max_end_silence: int = None,
        app_id: str = None,
        terminology: str = None,
        workspace: str = None,
        api_key: str = None,
        base_address: str = None,
        data_id: str = None,
        **kwargs,
    ):
        if api_key is None:
            self.api_key = dashscope.api_key
        else:
            self.api_key = api_key  # type: ignore[has-type]
        if base_address is None:
            self.base_address = dashscope.base_websocket_api_url
        else:
            self.base_address = base_address  # type: ignore[has-type]

        if model is None:
            raise ModelRequired("Model is required!")

        self.data_id = data_id
        self.max_end_silence = max_end_silence
        self.model = model
        self.audio_format = audio_format
        self.app_id = app_id
        self.terminology = terminology
        self.sample_rate = sample_rate
        # continuous recognition with start() or once recognition with call()
        self._recognition_once = False
        self._callback = callback
        self._running = False
        self._stream_data = Queue()
        self._worker = None
        self._silence_timer = None
        self._kwargs = kwargs
        self._workspace = workspace
        self._start_stream_timestamp = -1
        self._first_package_timestamp = -1
        self._stop_stream_timestamp = -1
        self._on_complete_timestamp = -1
        self.request_id_confirmed = False
        self.last_request_id = uuid.uuid4().hex
        self.request = _Request()
        self.response = _TingWuResponse(
            self._callback,
            self.close,
        )  # 传递 self.close 作为回调

    def _on_message(  # pylint: disable=unused-argument
        self,
        ws,
        message,
    ):
        logger.debug(f"<<<<<<< Received message: {message}")
        if isinstance(message, str):
            self.response.handle_text_response(message)
        elif isinstance(message, (bytes, bytearray)):
            self.response.handle_binary_response(message)

    def _on_error(self, ws, error):  # pylint: disable=unused-argument
        logger.error(f"Error: {error}")
        if self._callback:
            error_code = ""  # 默认错误码
            if "connection" in str(error).lower():
                error_code = "1001"  # 连接错误
            elif "timeout" in str(error).lower():
                error_code = "1002"  # 超时错误
            elif "authentication" in str(error).lower():
                error_code = "1003"  # 认证错误
            self._callback.on_error(
                error_code=error_code,
                error_msg=str(error),
            )

    def _on_close(  # pylint: disable=unused-argument
        self,
        ws,
        close_status_code,
        close_msg,
    ):
        try:
            logger.debug(
                "WebSocket connection closed with status %s and message %s",  # noqa: E501
                close_status_code,
                close_msg,
            )
            if close_status_code is None:
                close_status_code = 1000
            if close_msg is None:
                close_msg = "websocket is closed"
            self._callback.on_close(close_status_code, close_msg)
        except Exception as e:
            logger.error(f"Error: {e}")

    def _on_open(self, ws):  # pylint: disable=unused-argument
        self._callback.on_open()
        self._running = True

    # def _on_pong(self):
    #     logger.debug("on pong")

    def start(self, **kwargs):
        """
        interface for starting TingWu connection
        """
        assert (
            self._callback is not None
        ), "Please set the callback to get the TingWu result."  # noqa E501

        if self._running:
            raise InvalidParameter("TingWu client has started.")

        # self._start_stream_timestamp = -1
        # self._first_package_timestamp = -1
        # self._stop_stream_timestamp = -1
        # self._on_complete_timestamp = -1
        if self._kwargs is not None and len(self._kwargs) != 0:
            self._kwargs.update(**kwargs)

        self._connect(self.api_key)
        logger.debug("connected with server.")
        self._send_start_request()

    def send_audio_data(self, speech_data: bytes):
        """send audio data to server"""
        if self._running:
            self.__send_binary_frame(speech_data)

    def stop(self):
        if self.ws is None or not self.ws.sock or not self.ws.sock.connected:
            self._callback.on_close(1001, "websocket is not connected")
            return
        _send_speech_json = self.request.generate_stop_request("stop")
        self._send_text_frame(_send_speech_json)

    """inner class"""  # pylint: disable=pointless-string-statement

    def _send_start_request(self):
        """send start request"""
        _start_json = self.request.generate_start_request(
            workspace_id=self._workspace,
            direction_name="start",
            app_id=self.app_id,
            model=self.model,
            audio_format=self.audio_format,
            sample_rate=self.sample_rate,
            terminology=self.terminology,
            max_end_silence=self.max_end_silence,
            data_id=self.data_id,
            **self._kwargs,
        )
        # send start request
        self._send_text_frame(_start_json)

    def _run_forever(self):
        self.ws.run_forever(ping_interval=5, ping_timeout=4)

    def _connect(self, api_key: str):
        """init websocket connection"""
        self.ws = websocket.WebSocketApp(
            self.base_address,  # type: ignore[has-type]
            header=self.request.get_websocket_header(api_key),
            on_open=self._on_open,
            on_message=self._on_message,
            on_error=self._on_error,
            on_close=self._on_close,
        )
        self.thread = threading.Thread(target=self._run_forever)
        # 统一心跳机制配置
        self.ws.ping_interval = 5
        self.ws.ping_timeout = 4
        self.thread.daemon = True
        self.thread.start()

        self._wait_for_connection()

    def close(self):
        if self.ws is None or not self.ws.sock or not self.ws.sock.connected:
            return
        self.ws.close()

    def _wait_for_connection(self):
        """wait for connection using event instead of busy waiting"""
        timeout = 5
        start_time = time.time()
        while (
            not (self.ws.sock and self.ws.sock.connected)
            and (time.time() - start_time) < timeout
        ):
            time.sleep(0.1)  # 短暂休眠，避免密集轮询

    def _send_text_frame(self, text: str):
        # 避免在日志中记录敏感信息，如API密钥等
        # 只记录非敏感信息
        if '"Authorization"' not in text:
            logger.info(">>>>>> send text frame : %s", text)
        else:
            logger.info(">>>>>> send text frame with authorization header")
        self.ws.send(text, websocket.ABNF.OPCODE_TEXT)

    def __send_binary_frame(self, binary: bytes):
        # _log.info('send binary frame length: %d' % len(binary))
        self.ws.send(binary, websocket.ABNF.OPCODE_BINARY)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cleanup()
        return False

    def cleanup(self):
        """cleanup resources"""
        try:
            if self.ws:
                self.ws.close()
            if self.thread and self.thread.is_alive():
                # 设置标志位通知线程退出
                self.thread.join(timeout=2)
            # 清除引用
            self.ws = None
            self.thread = None
            self._callback = None
            self.response = None
        except Exception as e:
            logger.error(f"Error in cleanup: {e}")

    def send_audio_frame(self, buffer: bytes):
        """Push audio to server

        Raises:
            InvalidParameter: Cannot send data to an uninitiated recognition.
        """
        if self._running is False:
            raise InvalidParameter("TingWu client has stopped.")

        if self._start_stream_timestamp < 0:
            self._start_stream_timestamp = time.time() * 1000
        logger.debug("send_audio_frame: %s", len(buffer))
        self.__send_binary_frame(buffer)


class _Request:
    def __init__(self):
        # websocket header
        self.ws_headers = None
        # request body for voice chat
        self.header = None
        self.payload = None
        # params
        self.task_id = None
        self.app_id = None
        self.workspace_id = None

    def get_websocket_header(self, api_key):
        ua = get_user_agent()
        self.ws_headers = {
            "User-Agent": ua,
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
        }
        log_headers = self.ws_headers.copy()
        log_headers["Authorization"] = "REDACTED"
        logger.info("websocket header: %s", log_headers)
        return self.ws_headers

    def generate_start_request(
        self,
        direction_name: str,
        app_id: str,
        model: str = None,
        workspace_id: str = None,
        audio_format: str = None,
        sample_rate: int = None,
        terminology: str = None,
        max_end_silence: int = None,
        data_id: str = None,
        **kwargs,
    ) -> str:
        """
        build start request.
        :param app_id: web console app id
        :param direction_name:
        :param workspace_id: web console workspace id
        :param model: model name
        :param audio_format: audio format
        :param sample_rate: sample rate
        :param terminology:
        :param max_end_silence:
        :param data_id:
        :return:
        Args:
            :
        """
        self._get_dash_request_header(ActionType.START)
        parameters = self._get_start_parameters(
            audio_format=audio_format,
            sample_rate=sample_rate,
            max_end_silence=max_end_silence,
            terminology=terminology,
            **kwargs,
        )
        self._get_dash_request_payload(
            direction_name=direction_name,
            app_id=app_id,
            workspace_id=workspace_id,
            model=model,
            data_id=data_id,
            request_params=parameters,
        )

        cmd = {
            "header": self.header,
            "payload": self.payload,
        }
        return json.dumps(cmd)

    @staticmethod
    def _get_start_parameters(
        audio_format: str = None,
        sample_rate: int = None,
        terminology: str = None,
        max_end_silence: int = None,
        **kwargs,
    ):
        """
        build start request parameters inner.
        :param kwargs: parameters
        :return
        """
        parameters = {}
        if audio_format is not None:
            parameters["format"] = audio_format
        if sample_rate is not None:
            parameters["sampleRate"] = sample_rate
        if terminology is not None:
            parameters["terminology"] = terminology
        if max_end_silence is not None:
            parameters["maxEndSilence"] = max_end_silence
        if kwargs is not None and len(kwargs) != 0:
            parameters.update(kwargs)
        return parameters

    def generate_stop_request(self, direction_name: str) -> str:
        """
        build stop request.
        :param direction_name
        :return
        """
        self._get_dash_request_header(ActionType.FINISHED)
        self._get_dash_request_payload(direction_name, self.app_id)

        cmd = {
            "header": self.header,
            "payload": self.payload,
        }
        return json.dumps(cmd)

    def _get_dash_request_header(self, action: str):
        """
        :param action: ActionType ：run-task, continue-task, finish-task
        """
        if self.task_id is None:
            self.task_id = get_random_uuid()
        self.header = DashHeader(action=action, task_id=self.task_id).to_dict()

    def _get_dash_request_payload(
        self,
        direction_name: str,
        app_id: str,
        workspace_id: str = None,
        custom_input=None,
        model: str = None,
        data_id: str = None,
        request_params=None,
    ):
        """
        build start request payload inner.
        :param direction_name: inner direction name
        :param app_id: web console app id
        :param request_params: start direction body parameters
        :param custom_input: user custom input
        :param data_id: data id
        :param model: model name
        """
        if custom_input is not None:
            input = custom_input  # pylint: disable=redefined-builtin
        else:
            input = RequestBodyInput(
                workspace_id=workspace_id,
                app_id=app_id,
                directive=direction_name,
                data_id=data_id,
            )

        self.payload = DashPayload(
            model=model,
            input=input.to_dict(),
            parameters=request_params,
        ).to_dict()


class _TingWuResponse:
    def __init__(self, callback: TingWuRealtimeCallback, close_callback=None):
        super().__init__()
        self.task_id = None  # 对话ID.
        self._callback = callback
        self._close_callback = close_callback  # 保存关闭回调函数

    def handle_text_response(self, response_json: str):
        """
        handle text response.
        :param response_json: json format response from server
        """
        logger.info("<<<<<< server response: %s", response_json)
        try:
            # try to parse response as json
            json_data = json.loads(response_json)
            header = json_data.get("header", {})
            if header.get("event") == "task-failed":
                logger.error(
                    "Server returned invalid message: %s",
                    response_json,
                )
                if self._callback:
                    self._callback.on_error(
                        error_code=header.get("error_code"),
                        error_msg=header.get("error_message"),
                    )
                return
            if header.get("event") == "task-started":
                self._handle_started(header.get("task_id"))
                return

            payload = json_data.get("payload", {})
            output = payload.get("output", {})
            if output is not None:
                action = output.get("action")
                logger.info("Server response action: %s", action)
                self._handle_tingwu_agent_text_response(
                    action=action,
                    response_json=json_data,
                )

        except json.JSONDecodeError:
            logger.error("Failed to parse message as JSON.")

    def handle_binary_response(self, response_binary: bytes):
        """
        handle binary response.
        :param response_binary: server response binary。
        """
        logger.info(
            "<<<<<< server response binary length: %d",
            len(response_binary),
        )

    def _handle_tingwu_agent_text_response(
        self,
        action: str,
        response_json: dict,
    ):
        payload = response_json.get("payload", {})
        output = payload.get("output", {})
        if action == "task-failed":
            self._callback.on_error(
                error_code=output.get("errorCode"),
                error_msg=output.get("errorMessage"),
            )
        elif action == "speech-listen":
            self._callback.on_speech_listen(response_json)
        elif action == "recognize-result":
            self._callback.on_recognize_result(response_json)
        elif action == "ai-result":
            self._callback.on_ai_result(response_json)
        elif action == "speech-end":  # ai-result事件永远会先于speech-end事件
            self._callback.on_stopped()
            if self._close_callback is not None:
                self._close_callback()
        else:
            logger.info("Unknown response name: %s", action)

    def _handle_started(self, task_id: str):
        self.task_id = task_id
        self._callback.on_started(self.task_id)  # type: ignore[arg-type]


def get_random_uuid() -> str:
    """generate random uuid."""
    return uuid.uuid4().hex


@dataclass
class RequestBodyInput:
    app_id: str
    directive: str
    data_id: str = field(default=None)
    workspace_id: str = field(default=None)

    def to_dict(self):
        body_input = {
            "appId": self.app_id,
            "directive": self.directive,
        }
        if self.workspace_id is not None:
            body_input["workspace_id"] = self.workspace_id
        if self.data_id is not None:
            body_input["dataId"] = self.data_id
        return body_input


@dataclass
class DashHeader:
    action: str
    task_id: str = field(default=get_random_uuid())
    streaming: str = field(default="duplex")  # 默认为 duplex

    def to_dict(self):
        return {
            "action": self.action,
            "task_id": self.task_id,
            "request_id": self.task_id,
            "streaming": self.streaming,
        }


@dataclass
class DashPayload:
    task_group: str = field(default="aigc")
    function: str = field(default="generation")
    model: str = field(default="")
    task: str = field(default="multimodal-generation")
    parameters: dict = field(default=None)  # type: ignore[arg-type]
    input: dict = field(default=None)  # type: ignore[arg-type]

    def to_dict(self):
        payload = {
            "task_group": self.task_group,
            "function": self.function,
            "model": self.model,
            "task": self.task,
        }

        if self.parameters is not None:
            payload["parameters"] = self.parameters

        if self.input is not None:
            payload["input"] = self.input

        return payload
