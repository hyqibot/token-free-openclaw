# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.
# mypy: disable-error-code="annotation-unchecked"

import json
import random
import threading
import time
import uuid
from dataclasses import dataclass
from enum import Enum, unique
from typing import Dict, List, Optional

import websocket

import dashscope
from dashscope.common.error import InputRequired, InvalidTask, ModelRequired
from dashscope.common.logging import logger
from dashscope.common.utils import get_user_agent
from dashscope.protocol.websocket import (
    ACTION_KEY,
    EVENT_KEY,
    HEADER,
    TASK_ID,
    ActionType,
    EventType,
    WebsocketStreamingMode,
)


@dataclass
class HotFix:
    """
    Hot fix parameters for pronunciation and text replacement.

    Attributes:
        pronunciation: List of pronunciation, e.g., [{"草地": "cao3 di4"}]
        replace: List of text replacement, e.g., [{"草地": "草弟"}]

    Example:
        hot_fix = HotFix(
             pronunciation=[{"草地": "cao3 di4"}],
             replace=[{"草地": "草弟"}]
         )
         hot_fix_dict = hot_fix.to_dict()
    """

    pronunciation: Optional[List[Dict[str, str]]] = None
    replace: Optional[List[Dict[str, str]]] = None

    def to_dict(self) -> Dict[str, List[Dict[str, str]]]:
        result = {}
        if self.pronunciation is not None:
            result["pronunciation"] = self.pronunciation
        if self.replace is not None:
            result["replace"] = self.replace
        return result


class ResultCallback:
    """
    An interface that defines callback methods for getting speech synthesis results. # noqa E501
    Derive from this class and implement its function to provide your own data.
    """

    def on_open(self) -> None:
        pass

    def on_complete(self) -> None:
        pass

    def on_error(self, message) -> None:
        pass

    def on_close(self) -> None:
        pass

    def on_event(self, message: str) -> None:
        pass

    def on_data(self, data: bytes) -> None:
        pass


@unique
class AudioFormat(Enum):
    DEFAULT = ("Default", 0, "0", 0)
    WAV_8000HZ_MONO_16BIT = ("wav", 8000, "mono", 0)
    WAV_16000HZ_MONO_16BIT = ("wav", 16000, "mono", 16)
    WAV_22050HZ_MONO_16BIT = ("wav", 22050, "mono", 16)
    WAV_24000HZ_MONO_16BIT = ("wav", 24000, "mono", 16)
    WAV_44100HZ_MONO_16BIT = ("wav", 44100, "mono", 16)
    WAV_48000HZ_MONO_16BIT = ("wav", 48000, "mono", 16)

    MP3_8000HZ_MONO_128KBPS = ("mp3", 8000, "mono", 128)
    MP3_16000HZ_MONO_128KBPS = ("mp3", 16000, "mono", 128)
    MP3_22050HZ_MONO_256KBPS = ("mp3", 22050, "mono", 256)
    MP3_24000HZ_MONO_256KBPS = ("mp3", 24000, "mono", 256)
    MP3_44100HZ_MONO_256KBPS = ("mp3", 44100, "mono", 256)
    MP3_48000HZ_MONO_256KBPS = ("mp3", 48000, "mono", 256)

    PCM_8000HZ_MONO_16BIT = ("pcm", 8000, "mono", 16)
    PCM_16000HZ_MONO_16BIT = ("pcm", 16000, "mono", 16)
    PCM_22050HZ_MONO_16BIT = ("pcm", 22050, "mono", 16)
    PCM_24000HZ_MONO_16BIT = ("pcm", 24000, "mono", 16)
    PCM_44100HZ_MONO_16BIT = ("pcm", 44100, "mono", 16)
    PCM_48000HZ_MONO_16BIT = ("pcm", 48000, "mono", 16)

    OGG_OPUS_8KHZ_MONO_32KBPS = ("opus", 8000, "mono", 32)
    OGG_OPUS_8KHZ_MONO_16KBPS = ("opus", 8000, "mono", 16)
    OGG_OPUS_16KHZ_MONO_16KBPS = ("opus", 16000, "mono", 16)
    OGG_OPUS_16KHZ_MONO_32KBPS = ("opus", 16000, "mono", 32)
    OGG_OPUS_16KHZ_MONO_64KBPS = ("opus", 16000, "mono", 64)
    OGG_OPUS_24KHZ_MONO_16KBPS = ("opus", 24000, "mono", 16)
    OGG_OPUS_24KHZ_MONO_32KBPS = ("opus", 24000, "mono", 32)
    OGG_OPUS_24KHZ_MONO_64KBPS = ("opus", 24000, "mono", 64)
    OGG_OPUS_48KHZ_MONO_16KBPS = ("opus", 48000, "mono", 16)
    OGG_OPUS_48KHZ_MONO_32KBPS = ("opus", 48000, "mono", 32)
    OGG_OPUS_48KHZ_MONO_64KBPS = ("opus", 48000, "mono", 64)

    def __init__(  # pylint: disable=redefined-builtin
        self,
        format,
        sample_rate,
        channels,
        bit_rate,
    ):
        self.format = format
        self.sample_rate = sample_rate
        self.channels = channels
        self.bit_rate = bit_rate

    def __str__(self):
        return f"{self.format.upper()} with {self.sample_rate}Hz sample rate, {self.channels} channel, {self.bit_rate}"  # noqa: E501  # pylint: disable=line-too-long


class Request:
    def __init__(  # pylint: disable=redefined-builtin
        self,
        apikey,
        model,
        voice,
        format="wav",
        sample_rate=16000,
        bit_rate=64000,
        volume=50,
        speech_rate=1.0,
        pitch_rate=1.0,
        seed=0,
        synthesis_type=0,
        instruction=None,
        language_hints: list = None,
    ):
        self.task_id = self.genUid()
        self.apikey = apikey
        self.voice = voice
        self.model = model
        self.format = format
        self.sample_rate = sample_rate
        self.bit_rate = bit_rate
        self.volume = volume
        self.speech_rate = speech_rate
        self.pitch_rate = pitch_rate
        self.seed = seed
        self.synthesis_type = synthesis_type
        self.instruction = instruction
        self.language_hints = language_hints

    def genUid(self):
        # 生成随机UUID
        return uuid.uuid4().hex

    def getWebsocketHeaders(self, headers, workspace):
        ua = get_user_agent()
        self.headers = {
            "user-agent": ua,
            "Authorization": "Bearer " + self.apikey,
        }
        if headers:
            self.headers = {**self.headers, **headers}
        if workspace:
            self.headers = {
                **self.headers,
                "X-DashScope-WorkSpace": workspace,
            }
        return self.headers

    def getStartRequest(self, additional_params=None):
        cmd = {
            HEADER: {
                ACTION_KEY: ActionType.START,
                TASK_ID: self.task_id,
                "streaming": WebsocketStreamingMode.DUPLEX,
            },
            "payload": {
                "model": self.model,
                "task_group": "audio",
                "task": "tts",
                "function": "SpeechSynthesizer",
                "input": {},
                "parameters": {
                    "voice": self.voice,
                    "volume": self.volume,
                    "text_type": "PlainText",
                    "sample_rate": self.sample_rate,
                    "rate": self.speech_rate,
                    "format": self.format,
                    "pitch": self.pitch_rate,
                    "seed": self.seed,
                    "type": self.synthesis_type,
                },
            },
        }
        if self.format == "opus":
            cmd["payload"]["parameters"]["bit_rate"] = self.bit_rate
        if additional_params:
            cmd["payload"]["parameters"].update(additional_params)
        if self.instruction is not None:
            cmd["payload"]["parameters"]["instruction"] = self.instruction
        if self.language_hints is not None:
            cmd["payload"]["parameters"][
                "language_hints"
            ] = self.language_hints
        return json.dumps(cmd)

    def getContinueRequest(self, text):
        cmd = {
            HEADER: {
                ACTION_KEY: ActionType.CONTINUE,
                TASK_ID: self.task_id,
                "streaming": WebsocketStreamingMode.DUPLEX,
            },
            "payload": {
                "model": self.model,
                "task_group": "audio",
                "task": "tts",
                "function": "SpeechSynthesizer",
                "input": {
                    "text": text,
                },
            },
        }
        return json.dumps(cmd)

    def getFinishRequest(self):
        cmd = {
            HEADER: {
                ACTION_KEY: ActionType.FINISHED,
                TASK_ID: self.task_id,
                "streaming": WebsocketStreamingMode.DUPLEX,
            },
            "payload": {
                "input": {},
            },
        }
        return json.dumps(cmd)


class SpeechSynthesizer:
    def __init__(  # pylint: disable=redefined-builtin
        self,
        model,
        voice,
        format: AudioFormat = AudioFormat.DEFAULT,
        volume=50,
        speech_rate=1.0,
        pitch_rate=1.0,
        seed=0,
        synthesis_type=0,
        instruction=None,
        language_hints: list = None,
        headers=None,
        callback: ResultCallback = None,
        workspace=None,
        url=None,
        hot_fix=None,
        additional_params=None,
    ):
        """
        CosyVoice Speech Synthesis SDK
        Parameters:
        -----------
        model: str
            Model name.
        voice: str
            Voice name.
        format: AudioFormat
            Synthesis audio format.
        volume: int
            The volume of the synthesized audio, with a range from 0 to 100. Default is 50.
        rate: float
            The speech rate of the synthesized audio, with a range from 0.5 to 2. Default is 1.0.  # noqa: E501  # pylint: disable=line-too-long
        pitch: float
            The pitch of the synthesized audio, with a range from 0.5 to 2. Default is 1.0.  # noqa: E501  # pylint: disable=line-too-long
        headers: Dict
            User-defined headers.
        callback: ResultCallback
            Callback to receive real-time synthesis results.
        workspace: str
            Dashscope workspace ID.
        url: str
            Dashscope WebSocket URL.
        seed: int
            The seed of the synthesizer, with a range from 0 to 65535. Default is 0.
        synthesis_type: int
            The type of the synthesizer, Default is 0.
        instruction: str
            The instruction of the synthesizer, max length is 128.
        language_hints: list
            The language hints of the synthesizer. supported language: zh, en.
        additional_params: Dict
            Additional parameters for the Dashscope API.
        hot_fix: Dict or HotFix
            Hot fix parameters for pronunciation and text replacement.
            Example: {
                "pronunciation": [{"草地": "cao3 di4"}],
                "replace": [{"草地": "草弟"}]
            }
        enable_markdown_filter: bool
            Whether to enable markdown filter. should be set into additional_params.
        """
        self.ws = None
        self.start_event = threading.Event()
        self.complete_event = threading.Event()
        self._stopped = threading.Event()
        self._audio_data: bytes = None
        self._is_started = False
        self._cancel = False
        self._cancel_lock = threading.Lock()
        self.async_call = True
        self._is_first = True
        self.async_call = True
        # since dashscope sdk will send first text in run-task
        self._start_stream_timestamp = -1
        self._first_package_timestamp = -1
        self._recv_audio_length = 0
        self.last_response = None
        self._close_ws_after_use = True
        self.__update_params(
            model,
            voice,
            format,
            volume,
            speech_rate,
            pitch_rate,
            seed,
            synthesis_type,
            instruction,
            language_hints,
            headers,
            callback,
            workspace,
            url,
            additional_params,
            self._close_ws_after_use,
            hot_fix,
        )

    def __send_str(self, data: str):
        logger.debug(">>>send %s", data)
        self.ws.send(data)

    def __connect(self, timeout_seconds=5) -> None:
        """
        Establish a connection to the Bailian WebSocket server,
        which can be used to pre-establish the connection and reduce interaction latency.  # noqa: E501  # pylint: disable=line-too-long
        If this function is not used to create the connection,
        it will be established when you first send text via call or streaming_call.  # noqa: E501
        Parameters:
        -----------
        timeout: int
            Throws TimeoutError exception if the connection is not established after times out seconds.  # noqa: E501  # pylint: disable=line-too-long
        """
        self.ws = websocket.WebSocketApp(
            self.url,
            header=self.request.getWebsocketHeaders(
                headers=self.headers,
                workspace=self.workspace,
            ),
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close,
        )
        self.thread = threading.Thread(target=self.ws.run_forever)
        self.thread.daemon = True
        self.thread.start()
        # 等待连接建立
        start_time = time.time()
        while (
            not (self.ws.sock and self.ws.sock.connected)
            and (time.time() - start_time) < timeout_seconds
        ):
            time.sleep(0.1)  # 短暂休眠，避免密集轮询
        if not (self.ws.sock and self.ws.sock.connected):
            raise TimeoutError(
                "websocket connection could not established within 5s. "
                "Please check your network connection, firewall settings, or server status.",  # noqa: E501  # pylint: disable=line-too-long
            )

    def __is_connected(self) -> bool:
        """
        Returns True if the connection is established and still exists;
        otherwise, returns False.
        """
        if not self.ws:
            return False
        if not (self.ws.sock and self.ws.sock.connected):
            return False
        return True

    def __reset(self):  # pylint: disable=unused-private-member
        self.start_event.clear()
        self.complete_event.clear()
        self._stopped.clear()
        self._audio_data: bytes = None
        self._is_started = False
        self._cancel = False
        self.async_call = True
        self._is_first = True
        self.async_call = True
        # since dashscope sdk will send first text in run-task
        self._start_stream_timestamp = -1
        self._first_package_timestamp = -1
        self._recv_audio_length = 0
        self.last_response = None

    def __update_params(  # pylint: disable=redefined-builtin
        self,
        model,
        voice,
        format: AudioFormat = AudioFormat.DEFAULT,
        volume=50,
        speech_rate=1.0,
        pitch_rate=1.0,
        seed=0,
        synthesis_type=0,
        instruction=None,
        language_hints: list = None,
        headers=None,
        callback: ResultCallback = None,
        workspace=None,
        url=None,
        additional_params=None,
        close_ws_after_use=True,
        hot_fix=None,
    ):
        if model is None:
            raise ModelRequired("Model is required!")
        if format is None:
            raise InputRequired("format is required!")
        if url is None:
            url = dashscope.base_websocket_api_url
        self.url = url
        self.apikey = dashscope.api_key
        if self.apikey is None:
            raise InputRequired("apikey is required!")
        self.headers = headers
        self.workspace = workspace

        # Merge hot_fix into additional_params
        if hot_fix is not None:
            if additional_params is None:
                additional_params = {}
            # Support both HotFix instance and dict
            if isinstance(hot_fix, HotFix):
                additional_params["hot_fix"] = hot_fix.to_dict()
            else:
                additional_params["hot_fix"] = hot_fix

        self.additional_params = additional_params
        self.model = model
        self.voice = voice
        self.aformat = format.format
        if self.aformat == "DEFAULT":
            self.aformat = "mp3"
        self.sample_rate = format.sample_rate
        if self.sample_rate == 0:
            self.sample_rate = 22050

        self.callback = callback
        if not self.callback:
            self.async_call = False
        self.request = Request(
            apikey=self.apikey,
            model=model,
            voice=voice,
            format=format.format,
            sample_rate=format.sample_rate,
            bit_rate=format.bit_rate,
            volume=volume,
            speech_rate=speech_rate,
            pitch_rate=pitch_rate,
            seed=seed,
            synthesis_type=synthesis_type,
            instruction=instruction,
            language_hints=language_hints,
        )
        self.last_request_id = self.request.task_id
        self._close_ws_after_use = close_ws_after_use

    def __str__(self):
        # pylint: disable=line-too-long
        return (
            f"[SpeechSynthesizer {self.__hash__()} desc] "
            f"model:{self.model}, voice:{self.voice}, "
            f"format:{self.aformat}, sample_rate:{self.sample_rate}, "
            f"connected:{self.__is_connected()}"
        )

    def __start_stream(self):
        self._start_stream_timestamp = time.time() * 1000
        self._first_package_timestamp = -1
        self._recv_audio_length = 0
        if self.callback is None:
            raise InputRequired("callback is required!")
        # reset inner params
        self._stopped.clear()
        self._stream_data = [""]
        self._worker = None
        self._audio_data: bytes = None

        if self._is_started:
            raise InvalidTask("task has already started.")
        # 建立ws连接
        if self.ws is None:
            self.__connect(5)
        # 发送run-task指令
        request = self.request.getStartRequest(self.additional_params)
        self.__send_str(request)
        if not self.start_event.wait(10):
            raise TimeoutError("start speech synthesizer failed within 5s.")
        self._is_started = True
        if self.callback:
            self.callback.on_open()

    def __submit_text(self, text):
        if not self._is_started:
            raise InvalidTask("speech synthesizer has not been started.")

        if self._stopped.is_set():
            raise InvalidTask("speech synthesizer task has stopped.")
        request = self.request.getContinueRequest(text)
        self.__send_str(request)

    # pylint: disable=useless-return
    def streaming_call(self, text: str):
        """
        Streaming input mode: You can call the stream_call function multiple times to send text.  # noqa: E501  # pylint: disable=line-too-long
        A session will be created on the first call.
        The session ends after calling streaming_complete.
        Parameters:
        -----------
        text: str
            utf-8 encoded text
        """
        if self._is_first:
            self._is_first = False
            self.__start_stream()
        self.__submit_text(text)
        return None

    def streaming_complete(self, complete_timeout_millis=600000):
        """
        Synchronously stop the streaming input speech synthesis task.
        Wait for all remaining synthesized audio before returning

        Parameters:
        -----------
        complete_timeout_millis: int
            Throws TimeoutError exception if it times out. If the timeout is not None  # noqa: E501
            and greater than zero, it will wait for the corresponding number of
            milliseconds; otherwise, it will wait indefinitely.
        """
        if not self._is_started:
            raise InvalidTask("speech synthesizer has not been started.")
        if self._stopped.is_set():
            raise InvalidTask("speech synthesizer task has stopped.")
        request = self.request.getFinishRequest()
        self.__send_str(request)
        if complete_timeout_millis is not None and complete_timeout_millis > 0:
            if not self.complete_event.wait(
                timeout=complete_timeout_millis / 1000,
            ):
                raise TimeoutError(
                    f"speech synthesizer wait for complete timeout "
                    f"{complete_timeout_millis}ms",
                )
        else:
            self.complete_event.wait()
        if self._close_ws_after_use:
            self.close()
        self._stopped.set()
        self._is_started = False

    def __waiting_for_complete(self, timeout):
        if timeout is not None and timeout > 0:
            if not self.complete_event.wait(timeout=timeout / 1000):
                raise TimeoutError(
                    f"speech synthesizer wait for complete timeout {timeout}ms",  # noqa: E501
                )
        else:
            self.complete_event.wait()
        if self._close_ws_after_use:
            self.close()
        self._stopped.set()
        self._is_started = False

    def async_streaming_complete(self, complete_timeout_millis=600000):
        """
        Asynchronously stop the streaming input speech synthesis task, returns immediately.  # noqa: E501  # pylint: disable=line-too-long
        You need to listen and handle the STREAM_INPUT_TTS_EVENT_SYNTHESIS_COMPLETE event in the on_event callback.  # noqa: E501  # pylint: disable=line-too-long
        Do not destroy the object and callback before this event.

        Parameters:
        -----------
        complete_timeout_millis: int
            Throws TimeoutError exception if it times out. If the timeout is not None  # noqa: E501
            and greater than zero, it will wait for the corresponding number of
            milliseconds; otherwise, it will wait indefinitely.
        """

        if not self._is_started:
            raise InvalidTask("speech synthesizer has not been started.")
        if self._stopped.is_set():
            raise InvalidTask("speech synthesizer task has stopped.")
        request = self.request.getFinishRequest()
        self.__send_str(request)
        thread = threading.Thread(
            target=self.__waiting_for_complete,
            args=(complete_timeout_millis,),
        )
        thread.start()

    def streaming_cancel(self):
        """
        Immediately terminate the streaming input speech synthesis task
        and discard any remaining audio that is not yet delivered.
        """

        if not self._is_started:
            raise InvalidTask("speech synthesizer has not been started.")
        if self._stopped.is_set():
            return
        request = self.request.getFinishRequest()
        self.__send_str(request)
        self.ws.close()
        self.start_event.set()
        self.complete_event.set()

    # 监听消息的回调函数
    def on_message(  # pylint: disable=unused-argument,too-many-branches
        self,
        ws,
        message,
    ):
        if isinstance(message, str):
            logger.debug("<<<recv %s", message)
            try:
                # 尝试将消息解析为JSON
                json_data = json.loads(message)
                self.last_response = json_data
                event = json_data["header"][EVENT_KEY]
                # 调用JSON回调
                if EventType.STARTED == event:
                    self.start_event.set()
                elif EventType.FINISHED == event:
                    self.complete_event.set()
                    if self.callback:
                        self.callback.on_complete()
                        self.callback.on_close()
                elif EventType.FAILED == event:
                    self.start_event.set()
                    self.complete_event.set()
                    if self.async_call:
                        self.callback.on_error(message)
                        self.callback.on_close()
                    else:
                        logger.error(f"TaskFailed: {message}")
                        # pylint: disable=broad-exception-raised
                        raise Exception(f"TaskFailed: {message}")
                elif EventType.GENERATED == event:
                    if self.callback:
                        self.callback.on_event(message)
                else:
                    pass
            except json.JSONDecodeError:
                logger.error("Failed to parse message as JSON.")
                # pylint: disable=broad-exception-raised,raise-missing-from
                raise Exception("Failed to parse message as JSON.")
        elif isinstance(message, (bytes, bytearray)):
            # 如果失败，认为是二进制消息
            logger.debug("<<<recv binary %s", len(message))
            if self._recv_audio_length == 0:
                self._first_package_timestamp = time.time() * 1000
                logger.debug(
                    "first package delay %s",
                    self._first_package_timestamp
                    - self._start_stream_timestamp,
                )
            self._recv_audio_length += len(message) / (
                2 * self.sample_rate / 1000
            )
            current = time.time() * 1000
            current_rtf = (
                current - self._start_stream_timestamp
            ) / self._recv_audio_length
            logger.debug(
                "total audio %s ms, current_rtf: %s",
                self._recv_audio_length,
                current_rtf,
            )
            # 只有在非异步调用的时候保存音频
            if not self.async_call:
                if self._audio_data is None:
                    self._audio_data = bytes(message)
                else:
                    self._audio_data = self._audio_data + bytes(message)
            if self.callback:
                self.callback.on_data(message)

    def call(self, text: str, timeout_millis=None):
        """
        Speech synthesis.
        If callback is set, the audio will be returned in real-time through the on_event interface.  # noqa: E501  # pylint: disable=line-too-long
        Otherwise, this function blocks until all audio is received and then returns the complete audio data.  # noqa: E501  # pylint: disable=line-too-long

        Parameters:
        -----------
        text: str
            utf-8 encoded text
        timeoutMillis:
            Integer or None
        return: bytes
            If a callback is not set during initialization, the complete audio is returned  # noqa: E501  # pylint: disable=line-too-long
            as the function's return value. Otherwise, the return value is null.  # noqa: E501
            If the timeout is set to a value greater than zero and not None,
            it will wait for the corresponding number of milliseconds;
            otherwise, it will wait indefinitely.
        """
        # print('还不支持非流式语音合成sdk调用大模型，使用流式模拟')
        if self.additional_params is None:
            self.additional_params = {"enable_ssml": True}
        else:
            self.additional_params["enable_ssml"] = True
        if not self.callback:
            self.callback = ResultCallback()
        self.__start_stream()
        self.__submit_text(text)
        if self.async_call:
            self.async_streaming_complete(timeout_millis)
            return None
        else:
            self.streaming_complete(timeout_millis)
            return self._audio_data

    # WebSocket关闭的回调函数
    def on_close(  # pylint: disable=unused-argument
        self,
        ws,
        close_status_code,
        close_msg,
    ):
        pass

    # WebSocket发生错误的回调函数
    def on_error(self, ws, error):  # pylint: disable=unused-argument
        print(f"websocket closed due to {error}")
        # pylint: disable=broad-exception-raised
        raise Exception(f"websocket closed due to {error}")

    # 关闭WebSocket连接
    def close(self):
        self.ws.close()

    # 获取上一个任务的taskId
    def get_last_request_id(self):
        return self.last_request_id

    def get_first_package_delay(self):
        """First Package Delay is the time between start sending text and receive first audio package"""  # noqa: E501  # pylint: disable=line-too-long
        return self._first_package_timestamp - self._start_stream_timestamp

    def get_response(self):
        return self.last_response


class SpeechSynthesizerObjectPool:
    _instance_lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if not hasattr(SpeechSynthesizerObjectPool, "_instance"):
            with SpeechSynthesizerObjectPool._instance_lock:
                if not hasattr(SpeechSynthesizerObjectPool, "_instance"):
                    SpeechSynthesizerObjectPool._instance = object.__new__(cls)
        return SpeechSynthesizerObjectPool._instance

    class PoolObject:
        def __init__(self, synthesizer):
            self.synthesizer: SpeechSynthesizer = synthesizer
            self.connect_time = -1

        def __str__(self):
            return f"synthesizer: {self.synthesizer}, connect_time: {self.connect_time}"  # noqa: E501  # pylint: disable=line-too-long

    def __init__(
        self,
        max_size: int = 20,
        url=None,
        headers=None,
        workspace=None,
    ):
        """
        Speech synthesis object pool that follows the singleton pattern,
        establishes WebSocket connections in advance to avoid connection overhead.  # noqa: E501
        The connection pool will maintain a number of pre-created synthesizer objects  # noqa: E501
        up to max_size; objects taken from the pool do not need to be returned,
        and the pool will automatically replenish them.

        Parameters:
        -----------
        max_size: int
            Size of the object pool, with a value range of 1 to 100.
        """
        self.DEFAULT_MODEL = "cosyvoice-v1"
        self.DEFAULT_VOICE = "longxiaochun"
        self.DEFAULT_RECONNECT_INTERVAL = 30
        self.DEFAULT_URL = url
        self.DEFAUTL_HEADERS = headers
        self.DEFAULT_WORKSPACE = workspace
        if max_size <= 0:
            raise ValueError("max_size must be greater than 0")
        if max_size > 100:
            raise ValueError("max_size must be less than 100")
        self._pool = []
        # 如果重连中，则会将avaliable置为False，避免被使用
        self._avaliable = []
        self._pool_size = max_size
        for i in range(self._pool_size):  # pylint: disable=unused-variable
            synthesizer = self.__get_default_synthesizer()
            tmpPoolObject = self.PoolObject(synthesizer)
            tmpPoolObject.synthesizer._SpeechSynthesizer__connect()
            tmpPoolObject.connect_time = time.time()
            self._pool.append(tmpPoolObject)
            self._avaliable.append(True)
        self._borrowed_object_num = 0
        self._remain_object_num = max_size
        self._lock = threading.Lock()
        self._stop = False
        self._stop_lock = threading.Lock()
        self._working_thread = threading.Thread(
            target=self.__auto_reconnect,
            args=(),
        )
        self._working_thread.start()

    def __get_default_synthesizer(self) -> SpeechSynthesizer:
        return SpeechSynthesizer(
            model=self.DEFAULT_MODEL,
            voice=self.DEFAULT_VOICE,
            url=self.DEFAULT_URL,
            headers=self.DEFAUTL_HEADERS,
            workspace=self.DEFAULT_WORKSPACE,
        )

    def __get_reconnect_interval(self):
        return self.DEFAULT_RECONNECT_INTERVAL + random.random() * 10 - 5

    def __auto_reconnect(self):
        logger.debug(
            "speech synthesizer object pool auto reconnect thread start",
        )
        while True:
            objects_need_to_connect = []
            objects_need_to_renew = []
            logger.debug(
                "scanning queue borr: %s/%s remain: %s/%s",
                self._borrowed_object_num,
                self._pool_size,
                self._remain_object_num,
                self._pool_size,
            )
            with self._lock:
                if self._stop:
                    return

                current_time = time.time()
                for idx, poolObject in enumerate(self._pool):
                    # 如果超过固定时间没有使用对象，则重连
                    if poolObject.connect_time == -1:
                        objects_need_to_connect.append(poolObject)
                        self._avaliable[idx] = False
                    elif (
                        # Access private method for connection check
                        not poolObject.synthesizer._SpeechSynthesizer__is_connected()  # pylint: disable=protected-access  # noqa: E501
                    ) or (
                        current_time - poolObject.connect_time
                        > self.__get_reconnect_interval()
                    ):
                        objects_need_to_renew.append(poolObject)
                        self._avaliable[idx] = False
            for poolObject in objects_need_to_connect:
                logger.info(
                    "[SpeechSynthesizerObjectPool] pre-connect new synthesizer",  # noqa: E501
                )
                # Access private method to establish connection
                poolObject.synthesizer._SpeechSynthesizer__connect()  # pylint: disable=protected-access # noqa: E501
                poolObject.connect_time = time.time()
            for poolObject in objects_need_to_renew:
                # pylint: disable=line-too-long
                logger.info(
                    "[SpeechSynthesizerObjectPool] renew synthesizer after %s s",  # noqa: E501
                    current_time - poolObject.connect_time,
                )
                poolObject.synthesizer = self.__get_default_synthesizer()
                # Access private method to establish connection
                poolObject.synthesizer._SpeechSynthesizer__connect()  # pylint: disable=protected-access # noqa: E501
                poolObject.connect_time = time.time()
            with self._lock:
                # pylint: disable=consider-using-enumerate
                for i in range(len(self._avaliable)):
                    self._avaliable[i] = True
            time.sleep(1)

    def shutdown(self):
        """
        This is a ThreadSafe Method.
        destroy the object pool
        """
        logger.debug("[SpeechSynthesizerObjectPool] start shutdown")
        with self._lock:
            self._stop = True
            self._pool = []
        self._working_thread.join()
        logger.debug("[SpeechSynthesizerObjectPool] shutdown complete")

    def borrow_synthesizer(  # pylint: disable=unused-argument,redefined-builtin # noqa: E501
        self,
        model,
        voice,
        format: AudioFormat = AudioFormat.DEFAULT,
        volume=50,
        speech_rate=1.0,
        pitch_rate=1.0,
        seed=0,
        synthesis_type=0,
        instruction=None,
        language_hints: list = None,
        headers=None,
        callback: ResultCallback = None,
        workspace=None,
        url=None,
        additional_params=None,
    ):
        """
        This is a ThreadSafe Method.
        get a synthesizer object from the pool.
        objects taken from the pool need to be returned,
        and the pool will automatically replenish them.
        If there is no synthesizer object in the pool,
        a new synthesizer object will be created and returned.
        """
        logger.debug("[SpeechSynthesizerObjectPool] get synthesizer")
        synthesizer: SpeechSynthesizer = None
        with self._lock:
            # 遍历对象池，如果存在预建连的对象，则返回
            for idx, poolObject in enumerate(self._pool):
                if (
                    self._avaliable[idx]
                    # Access private method for connection check
                    and poolObject.synthesizer._SpeechSynthesizer__is_connected()  # pylint: disable=protected-access  # noqa: E501
                ):
                    synthesizer = poolObject.synthesizer
                    self._borrowed_object_num += 1
                    self._remain_object_num -= 1
                    self._pool.pop(idx)
                    self._avaliable.pop(idx)
                    break

        # 如果对象池不足，则返回未建连的新对象
        if synthesizer is None:
            synthesizer = self.__get_default_synthesizer()
            logger.warning(
                "[SpeechSynthesizerObjectPool] object pool is exausted, create new synthesizer",  # noqa: E501  # pylint: disable=line-too-long
            )
        # Access private methods to reset and update synthesizer params
        synthesizer._SpeechSynthesizer__reset()  # pylint: disable=protected-access # noqa: E501
        synthesizer._SpeechSynthesizer__update_params(  # pylint: disable=protected-access # noqa: E501
            model,
            voice,
            format,
            volume,
            speech_rate,
            pitch_rate,
            seed,
            synthesis_type,
            instruction,
            language_hints,
            self.DEFAUTL_HEADERS,
            callback,
            self.DEFAULT_WORKSPACE,
            self.DEFAULT_URL,
            additional_params,
            False,
        )
        return synthesizer

    # pylint: disable=inconsistent-return-statements
    def return_synthesizer(self, synthesizer) -> bool:  # type: ignore[return]
        """
        This is a ThreadSafe Method.
        return a synthesizer object back to the pool.
        """
        if not isinstance(synthesizer, SpeechSynthesizer):
            logger.error(
                "[SpeechSynthesizerObjectPool] return_synthesizer: synthesizer is not a SpeechSynthesizer object",  # noqa: E501  # pylint: disable=line-too-long
            )
            return False
        with self._lock:
            if self._borrowed_object_num <= 0:
                logger.debug(
                    "[SpeechSynthesizerObjectPool] pool is full, drop returned object",  # noqa: E501  # pylint: disable=line-too-long
                )
                return False
            poolObject = self.PoolObject(synthesizer)
            poolObject.connect_time = time.time()
            self._pool.append(poolObject)
            self._avaliable.append(True)
            self._borrowed_object_num -= 1
            self._remain_object_num += 1
            logger.debug(
                "[SpeechSynthesizerObjectPool] return synthesizer back to pool",  # noqa: E501
            )
