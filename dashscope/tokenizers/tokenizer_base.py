# -*- coding: utf-8 -*-
# Copyright (c) Alibaba, Inc. and its affiliates.

from typing import List


class Tokenizer:
    """Base tokenizer interface for local tokenizers."""

    def __init__(self):
        pass

    def encode(self, text: str, **kwargs) -> List[int]:  # type: ignore[empty-body] # noqa: E501
        """Encode input text string to token ids.

        Args:
            text (str): The string to be encoded.

        Returns:
            List[int]: The token ids.
        """

    def decode(self, token_ids: List[int], **kwargs) -> str:  # type: ignore[empty-body] # pylint: disable=line-too-long # noqa: E501
        """Decode token ids to string.

        Args:
            token_ids (List[int]): The input token ids.

        Returns:
            str: The string of the token ids.
        """
