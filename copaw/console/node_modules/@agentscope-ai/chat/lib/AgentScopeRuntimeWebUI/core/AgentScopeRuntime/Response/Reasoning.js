import { AgentScopeRuntimeRunStatus } from "../types";
import { Thinking } from "../../../..";
import { jsx as _jsx } from "react/jsx-runtime";
export default function Reasoning(_ref) {
  var _data$content;
  var data = _ref.data;
  if (data.status === AgentScopeRuntimeRunStatus.Created) return null;
  var content = data === null || data === void 0 || (_data$content = data.content) === null || _data$content === void 0 ? void 0 : _data$content[0];
  if (!content) return null;
  return /*#__PURE__*/_jsx(Thinking, {
    loading: data.status === AgentScopeRuntimeRunStatus.InProgress,
    title: "Thinking",
    content: content.text
  });
}