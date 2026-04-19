import { uuid } from "../../../..";
import { useCallback } from "react";
import ReactDOM from "react-dom";
import { useChatAnywhereMessages } from "../../Context/ChatAnywhereMessagesContext";
import AgentScopeRuntimeRequestBuilder from "../../AgentScopeRuntime/Request/Builder";
/**
 * 处理消息创建和更新的 Hook
 */
export default function useChatMessageHandler(options) {
  var currentQARef = options.currentQARef;
  var _useChatAnywhereMessa = useChatAnywhereMessages(),
    updateMessage = _useChatAnywhereMessa.updateMessage,
    getMessages = _useChatAnywhereMessa.getMessages,
    removeMessage = _useChatAnywhereMessa.removeMessage;

  /**
   * 创建用户请求消息
   */
  var createRequestMessage = useCallback(function (data) {
    currentQARef.current.abortController = new AbortController();
    currentQARef.current.request = {
      id: uuid(),
      role: 'user',
      cards: [{
        code: 'AgentScopeRuntimeRequestCard',
        data: new AgentScopeRuntimeRequestBuilder().handle(data)
      }]
    };
    ReactDOM.flushSync(function () {
      updateMessage(currentQARef.current.request);
    });
    return currentQARef.current.request;
  }, [currentQARef, updateMessage]);
  var createApprovalMessage = useCallback(function (data) {
    currentQARef.current.abortController = new AbortController();
    currentQARef.current.request = {
      id: uuid(),
      role: 'user',
      cards: [{
        code: 'AgentScopeRuntimeRequestCard',
        data: new AgentScopeRuntimeRequestBuilder().handleApproval(data)
      }]
    };
    ReactDOM.flushSync(function () {
      updateMessage(currentQARef.current.request);
    });
    return currentQARef.current.request;
  }, [currentQARef, updateMessage]);

  /**
   * 创建助手响应消息
   */
  var createResponseMessage = useCallback(function () {
    currentQARef.current.response = {
      id: uuid(),
      role: 'assistant',
      cards: [],
      msgStatus: 'generating'
    };
    updateMessage(currentQARef.current.response);
    return currentQARef.current.response;
  }, [currentQARef, updateMessage]);

  /**
   * 获取历史消息（用于 API 请求）
   */
  var getHistoryMessages = useCallback(function () {
    return AgentScopeRuntimeRequestBuilder.getHistoryMessages(getMessages());
  }, [getMessages]);

  /**
   * 移除指定消息
   */
  var removeMessageById = useCallback(function (id) {
    ReactDOM.flushSync(function () {
      removeMessage({
        id: id
      });
    });
  }, [removeMessage]);
  return {
    createRequestMessage: createRequestMessage,
    createApprovalMessage: createApprovalMessage,
    createResponseMessage: createResponseMessage,
    getHistoryMessages: getHistoryMessages,
    updateMessage: updateMessage,
    removeMessageById: removeMessageById,
    getMessages: getMessages
  };
}