"""
The MIT License (MIT)

Copyright (c) 2015-present Rapptz

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
"""

from __future__ import annotations
from typing import Dict, Iterator, List, Literal, Optional, Tuple

from .state import ConnectionState

__all__ = (
    'SearchAuthorType',
    'SearchHas',
    'SearchEmbedType',
    'SearchResult',
)


class _BaseSearchType:
    __slots__ = ('value',)

    def __init__(self) -> None:
        self.value: Dict[str, bool] = {}

    def __iter__(self) -> Iterator[str]:
        for key, value in self.value.items():
            if value:
                yield key
            else:
                yield f'-{key}'


class SearchAuthorType(_BaseSearchType):
    """Represents the search ``author_type`` filter.

    .. versionadded:: 2.7

    Parameters
    ----------
    user: Optional[:class:`bool`]
        Whether to include regular users in the search. This can be ``False`` to exclude instead.
    bot: Optional[:class:`bool`]
        Whether to include bots in the search. This can be ``False`` to exclude instead.
    webhook: Optional[:class:`bool`]
        Whether to include webhooks in the search. This can be ``False`` to exclude instead.
    """

    __slots__ = ()

    def __init__(self, *, user: Optional[bool] = None, bot: Optional[bool] = None, webhook: Optional[bool] = None) -> None:
        super().__init__()

        if user is not None:
            self.value['user'] = user
        if bot is not None:
            self.value['bot'] = bot
        if webhook is not None:
            self.value['webhook'] = webhook

    @property
    def user(self) -> Optional[bool]:
        """Optional[bool]: Whether regular users are included in the search."""
        return self.value.get('user', None)

    @user.setter
    def user(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('user', None)
        else:
            self.value['user'] = value

    @property
    def bot(self) -> Optional[bool]:
        """Optional[bool]: Whether bots are included in the search."""
        return self.value.get('bot', None)

    @bot.setter
    def bot(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('bot', None)
        else:
            self.value['bot'] = value

    @property
    def webhook(self) -> Optional[bool]:
        """Optional[bool]: Whether webhooks are included in the search."""
        return self.value.get('webhook', None)

    @webhook.setter
    def webhook(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('webhook', None)
        else:
            self.value['webhook'] = value


class SearchHas(_BaseSearchType):
    """Represents the search ``has`` filter.

    .. versionadded:: 2.7

    Parameters
    ----------
    link: Optional[:class:`bool`]
        Whether to include messages with a link. This can be ``False`` to exclude instead.
    embed: Optional[:class:`bool`]
        Whether to include messages with an embed. This can be ``False`` to exclude instead.
    file: Optional[:class:`bool`]
        Whether to include messages with an uploaded file. This can be ``False`` to exclude instead.
    image: Optional[:class:`bool`]
        Whether to include messages with an image. This can be ``False`` to exclude instead.
    video: Optional[:class:`bool`]
        Whether to include messages with a video. This can be ``False`` to exclude instead.
    sound: Optional[:class:`bool`]
        Whether to include messages with an uploaded audio file. This can be ``False`` to exclude instead.
    sticker: Optional[:class:`bool`]
        Whether to include messages with a sticker. This can be ``False`` to exclude instead.
    poll: Optional[:class:`bool`]
        Whether to include messages with a poll. This can be ``False`` to exclude instead.
    snapshot: Optional[:class:`bool`]
        Whether to include messages with a forwarded message. This can be ``False`` to exclude instead.
    """

    def __init__(
        self,
        *,
        link: Optional[bool] = None,
        embed: Optional[bool] = None,
        file: Optional[bool] = None,
        image: Optional[bool] = None,
        video: Optional[bool] = None,
        sound: Optional[bool] = None,
        sticker: Optional[bool] = None,
        poll: Optional[bool] = None,
        snapshot: Optional[bool] = None,
    ) -> None:
        super().__init__()
        if link is not None:
            self.value['link'] = link
        if embed is not None:
            self.value['embed'] = embed
        if file is not None:
            self.value['file'] = file
        if image is not None:
            self.value['image'] = image
        if video is not None:
            self.value['video'] = video
        if sound is not None:
            self.value['sound'] = sound
        if sticker is not None:
            self.value['sticker'] = sticker
        if poll is not None:
            self.value['poll'] = poll
        if snapshot is not None:
            self.value['snapshot'] = snapshot

    @property
    def link(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether to include messages with a link."""
        return self.value.get('link', None)

    @link.setter
    def link(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('link', None)
        else:
            self.value['link'] = value

    @property
    def embed(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether to include messages with an embed."""
        return self.value.get('embed', None)

    @embed.setter
    def embed(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('embed', None)
        else:
            self.value['embed'] = value

    @property
    def file(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether to include messages with an uploaded file."""
        return self.value.get('file', None)

    @file.setter
    def file(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('file', None)
        else:
            self.value['file'] = value

    @property
    def image(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether to include messages with an image."""
        return self.value.get('image', None)

    @image.setter
    def image(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('image', None)
        else:
            self.value['image'] = value

    @property
    def video(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether to include messages with a video."""
        return self.value.get('video', None)

    @video.setter
    def video(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('video', None)
        else:
            self.value['video'] = value

    @property
    def sound(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether to include messages with an uploaded audio file."""
        return self.value.get('sound', None)

    @sound.setter
    def sound(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('sound', None)
        else:
            self.value['sound'] = value

    @property
    def sticker(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether to include messages with a sticker."""
        return self.value.get('sticker', None)

    @sticker.setter
    def sticker(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('sticker', None)
        else:
            self.value['sticker'] = value

    @property
    def poll(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether to include messages with a poll."""
        return self.value.get('poll', None)

    @poll.setter
    def poll(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('poll', None)
        else:
            self.value['poll'] = value

    @property
    def snapshot(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether to include messages with a forwarded message."""
        return self.value.get('snapshot', None)

    @snapshot.setter
    def snapshot(self, value: Optional[bool]) -> None:
        if value is None:
            self.value.pop('snapshot', None)
        else:
            self.value['snapshot'] = value


class SearchEmbedType(_BaseSearchType):
    """Represents the search ``embed_type`` filter.

    .. versionadded:: 2.7

    Parameters
    ----------
    image: Optional[:class:`bool`]
        Whether to include image embeds. This *cannot* be ``False`` to exclude.
    video: Optional[:class:`bool`]
        Whether to include video embeds. This *cannot* be ``False`` to exclude.
    gif: Optional[:class:`bool`]
        Whether to include gif embeds. This *cannot* be ``False`` to exclude.
    sound: Optional[:class:`bool`]
        Whether to include sound embeds. This *cannot* be ``False`` to exclude.
    article: Optional[:class:`bool`]
        Whether to include article embeds. This *cannot* be ``False`` to exclude.
    """

    def __init__(
        self,
        *,
        image: Literal[True, None] = None,
        video: Literal[True, None] = None,
        gif: Literal[True, None] = None,
        sound: Literal[True, None] = None,
        article: Literal[True, None] = None,
    ) -> None:
        super().__init__()

        if image:
            self.value['image'] = True
        if video:
            self.value['video'] = True
        if gif:
            self.value['gif'] = True
        if sound:
            self.value['sound'] = True
        if article:
            self.value['article'] = True

    @property
    def image(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether image embeds are included in the search."""
        return self.value.get('image', None)

    @image.setter
    def image(self, value: Literal[True, None]) -> None:
        if value:
            self.value['image'] = True
        else:
            self.value.pop('image', None)

    @property
    def video(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether video embeds are included in the search."""
        return self.value.get('video', None)

    @video.setter
    def video(self, value: Literal[True, None]) -> None:
        if value:
            self.value['video'] = True
        else:
            self.value.pop('video', None)

    @property
    def gif(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether gif embeds are included in the search."""
        return self.value.get('gif', None)

    @gif.setter
    def gif(self, value: Literal[True, None]) -> None:
        if value:
            self.value['gif'] = True
        else:
            self.value.pop('gif', None)

    @property
    def sound(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether sound embeds are included in the search."""
        return self.value.get('sound', None)

    @sound.setter
    def sound(self, value: Literal[True, None]) -> None:
        if value:
            self.value['sound'] = True
        else:
            self.value.pop('sound', None)

    @property
    def article(self) -> Optional[bool]:
        """Optional[:class:`bool`]: Whether article embeds are included in the search."""
        return self.value.get('article', None)

    @article.setter
    def article(self, value: Literal[True, None]) -> None:
        if value:
            self.value['article'] = True
        else:
            self.value.pop('article', None)


# class SearchResult:
#     """Represents the search results from :meth:`Guild.search`.

#     .. versionadded:: 2.7

#     Attributes
#     -----------
#     total_results: :class:`int`
#         The total number of results that match the search criteria.
#     """

#     def __init__(self, total_results: int, results: list[discord.Message]) -> None:
#         self.total_results = total_results
#         self.results = results

#     def __repr__(self) -> str:
#         return f'<SearchResult total_results={self.total_results} results={len(self.results)}>'


class _SearchResultFuture:
    def __init__(
        self,
        *,
        state: ConnectionState,
        params: List[Tuple[str, str]],
        limit: Optional[int],
        wait_for_index: bool,
    ) -> None:
        self.params: List[Tuple[str, str]] = params
        self.state: ConnectionState = state
        self.limit: Optional[int] = limit
        self.wait_for_index: bool = wait_for_index
