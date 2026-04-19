import React from "react";
import { useProviderContext } from "../..";
import { isMobileHook } from "../Layout";
import { useChatAnywhere } from "../hooks/ChatAnywhereProvider";
import { useSessionList } from "../hooks/useSessionList";
import Style from "./style";
import { IconButton } from "@agentscope-ai/design";
import { SparkOperateLeftLine, SparkOperateRightLine } from "@agentscope-ai/icons";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
export default function () {
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('chat-anywhere-header');
  var uiConfig = useChatAnywhere(function (v) {
    return v.uiConfig;
  });
  var _useSessionList = useSessionList(),
    sessionListShow = _useSessionList.sessionListShow,
    setSessionListShow = _useSessionList.setSessionListShow;
  var isMobile = isMobileHook();
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsxs("div", {
      className: prefixCls,
      children: [isMobile && /*#__PURE__*/_jsx(IconButton, {
        style: {
          marginLeft: 12
        },
        bordered: false,
        onClick: function onClick() {
          return setSessionListShow(!sessionListShow);
        },
        icon: sessionListShow ? /*#__PURE__*/_jsx(SparkOperateLeftLine, {}) : /*#__PURE__*/_jsx(SparkOperateRightLine, {})
      }), uiConfig.header]
    })]
  });
}