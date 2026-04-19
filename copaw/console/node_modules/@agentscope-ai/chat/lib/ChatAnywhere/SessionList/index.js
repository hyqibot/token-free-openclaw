import React, { useEffect } from 'react';
import { Conversations } from "../..";
import cls from 'classnames';
import { useProviderContext } from "../..";
import { Button, IconButton } from '@agentscope-ai/design';
import { useChatAnywhere } from "../hooks/ChatAnywhereProvider";
import { useSessionList } from "../hooks/useSessionList";
import { useMessages } from "../hooks/useMessages";
import { isMobileHook } from "../Layout";
import Style from "./style";
import { SparkOperateLeftLine, SparkOperateRightLine, SparkPlusLine, SparkDeleteLine } from "@agentscope-ai/icons";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
export default function () {
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('chat-anywhere-session-list');
  var sessionListShow = useChatAnywhere(function (v) {
    return v.sessionListShow;
  });
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsxs("div", {
      className: cls("".concat(prefixCls), sessionListShow ? '' : "".concat(prefixCls, "-hide")),
      children: [/*#__PURE__*/_jsx(InnerAdder, {}), /*#__PURE__*/_jsx(InnerSession, {})]
    })]
  });
}
export function InnerSession() {
  var _useProviderContext2 = useProviderContext(),
    getPrefixCls = _useProviderContext2.getPrefixCls;
  var prefixCls = getPrefixCls('chat-anywhere-session-list');
  var _useSessionList = useSessionList(),
    currentSessionKey = _useSessionList.currentSessionKey,
    setCurrentSessionKey = _useSessionList.setCurrentSessionKey,
    currentRegenerateIndex = _useSessionList.currentRegenerateIndex,
    sessionList = _useSessionList.sessionList,
    getMessagesBySession = _useSessionList.getMessagesBySession,
    setSessionListShow = _useSessionList.setSessionListShow;
  var _useMessages = useMessages(),
    setMessages = _useMessages.setMessages;
  var getLoading = useChatAnywhere(function (v) {
    return v.getLoading;
  });
  var onSessionKeyChange = useChatAnywhere(function (v) {
    return v.onSessionKeyChange;
  });
  var isMobile = isMobileHook();
  useEffect(function () {
    var messages = getMessagesBySession(currentSessionKey, currentRegenerateIndex);
    setMessages(messages);
  }, [currentSessionKey, currentRegenerateIndex]);
  return /*#__PURE__*/_jsx("div", {
    className: "".concat(prefixCls, "-session"),
    children: /*#__PURE__*/_jsx(Conversations, {
      menu: [{
        key: 'delete',
        icon: /*#__PURE__*/_jsx(SparkDeleteLine, {}),
        danger: true,
        onClick: function onClick(session) {}
      }],
      activeKey: currentSessionKey,
      items: sessionList,
      onActiveChange: function onActiveChange(key) {
        if (getLoading()) return;
        if (isMobile) {
          setSessionListShow(false);
        }
        requestIdleCallback(function () {
          setCurrentSessionKey(key);
          onSessionKeyChange(key);
        });
      }
    })
  });
}
export function InnerAdder() {
  var _useProviderContext3 = useProviderContext(),
    getPrefixCls = _useProviderContext3.getPrefixCls;
  var prefixCls = getPrefixCls('chat-anywhere-session-list');
  var _useSessionList2 = useSessionList(),
    currentSessionKey = _useSessionList2.currentSessionKey,
    setCurrentSessionKey = _useSessionList2.setCurrentSessionKey,
    deleteSession = _useSessionList2.deleteSession,
    createSession = _useSessionList2.createSession,
    sessionList = _useSessionList2.sessionList,
    sessionListShow = _useSessionList2.sessionListShow,
    setSessionListShow = _useSessionList2.setSessionListShow;
  var uiConfig = useChatAnywhere(function (v) {
    return v.uiConfig;
  });
  var isMobile = isMobileHook();
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsxs("div", {
      className: "".concat(prefixCls, "-logo"),
      children: [uiConfig === null || uiConfig === void 0 ? void 0 : uiConfig.logo, /*#__PURE__*/_jsx(IconButton, {
        bordered: false,
        onClick: function onClick() {
          return setSessionListShow(!sessionListShow);
        },
        icon: sessionListShow ? /*#__PURE__*/_jsx(SparkOperateLeftLine, {}) : /*#__PURE__*/_jsx(SparkOperateRightLine, {})
      })]
    }), /*#__PURE__*/_jsx("div", {
      className: "".concat(prefixCls, "-adder"),
      children: /*#__PURE__*/_jsx(Button, {
        type: "primary",
        block: true,
        icon: /*#__PURE__*/_jsx(SparkPlusLine, {}),
        onClick: function onClick() {
          if (isMobile) {
            setSessionListShow(false);
          }
          createSession();
        },
        children: "New Session"
      })
    })]
  });
}