# -*- coding: utf-8 -*-
# pylint: disable=unused-argument
import logging
import traceback
from typing import Callable

from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.types import UnsupportedOperationError
from a2a.utils.errors import ServerError

from agentscope_runtime.engine.deployers.adapter.a2a.a2a_adapter_utils import (
    agent_message_to_a2a_message,
)
from agentscope_runtime.engine.schemas.agent_schemas import (
    AgentRequest,
    RunStatus,
)

logger = logging.getLogger(__name__)


class A2AExecutor(AgentExecutor):
    def __init__(self, func: Callable, **kwargs):
        self._func = func

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        query = context.get_user_input()

        request = AgentRequest.model_validate(
            {
                "session_id": context.context_id,
                "response_id": context.task_id,
                "input": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": query,
                            },
                        ],
                    },
                ],
                "stream": True,
            },
        )

        try:
            async for event in self._func(request=request):
                if event.object == "response":
                    if event.status == RunStatus.Completed:
                        if event.output:
                            message = event.output[len(event.output) - 1]
                            a2a_message = agent_message_to_a2a_message(message)
                            await event_queue.enqueue_event(a2a_message)
        except Exception as e:
            logger.error(f"An error occurred: {e}, {traceback.format_exc()}")

    async def cancel(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        raise ServerError(error=UnsupportedOperationError())
