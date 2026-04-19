import React from "react";
import { AgentScopeRuntimeRunStatus } from "../types";
import { ToolCall } from "../../../..";
import { useChatAnywhereOptions } from "../../Context/ChatAnywhereOptionsContext";
import Approval from "./Approval";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Tool = /*#__PURE__*/React.memo(function (_ref) {
  var _data$content;
  var data = _ref.data,
    _ref$isApproval = _ref.isApproval,
    isApproval = _ref$isApproval === void 0 ? false : _ref$isApproval;
  var customToolRenderConfig = useChatAnywhereOptions(function (v) {
    return v.customToolRenderConfig;
  }) || {};
  if (!((_data$content = data.content) !== null && _data$content !== void 0 && _data$content.length)) return null;
  var content = data.content;
  var loading = data.status === AgentScopeRuntimeRunStatus.InProgress;
  var toolName = content[0].data.name;
  var serverLabel = "".concat(content[0].data.server_label ? content[0].data.server_label + ' / ' : '');
  var title = "".concat(serverLabel).concat(toolName);
  var node;
  if (customToolRenderConfig[toolName]) {
    var C = customToolRenderConfig[toolName];
    node = /*#__PURE__*/_jsx(C, {
      data: data
    });
  } else {
    var _content$, _content$2;
    node = /*#__PURE__*/_jsx(ToolCall, {
      loading: loading,
      defaultOpen: false,
      title: title === 'undefined' ? '' : title,
      input: (_content$ = content[0]) === null || _content$ === void 0 || (_content$ = _content$.data) === null || _content$ === void 0 ? void 0 : _content$.arguments,
      output: (_content$2 = content[1]) === null || _content$2 === void 0 || (_content$2 = _content$2.data) === null || _content$2 === void 0 ? void 0 : _content$2.output
    });
  }
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [node, isApproval && /*#__PURE__*/_jsx(Approval, {
      data: data
    })]
  });
});
export default Tool;