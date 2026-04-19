# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

from collections import deque
from typing import List

from dashscope.api_entities.dashscope_response import (
    ConversationResponse,
    GenerationResponse,
    Message,
)


class MessageManager(object):  # pylint: disable=useless-object-inheritance
    DEFAULT_MAXIMUM_MESSAGES = 100

    def __init__(self, max_length: int = None):
        if max_length is None:
            self._dq = deque(maxlen=MessageManager.DEFAULT_MAXIMUM_MESSAGES)
        else:
            self._dq = deque(maxlen=max_length)  # type: ignore[has-type]

    def add_generation_response(self, response: GenerationResponse):
        self._dq.append(Message.from_generation_response(response))  # type: ignore[has-type] # pylint: disable=line-too-long # noqa: E501

    def add_conversation_response(self, response: ConversationResponse):
        self._dq.append(Message.from_conversation_response(response))  # type: ignore[has-type] # pylint: disable=line-too-long # noqa: E501

    def add(self, message: Message):
        """Add message to message manager

        Args:
            message (Message): The message to add.
        """
        self._dq.append(message)  # type: ignore[has-type]

    def get(self) -> List[Message]:
        return list(self._dq)  # type: ignore[has-type]
