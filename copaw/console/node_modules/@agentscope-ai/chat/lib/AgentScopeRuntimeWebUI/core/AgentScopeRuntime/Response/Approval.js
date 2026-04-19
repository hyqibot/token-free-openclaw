var _templateObject;
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { StatusCard } from "../../../..";
import { Button } from '@agentscope-ai/design';
import { Flex } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createStyles } from 'antd-style';
import ApprovalCancelPopover from "./ApprovalCancelPopover";
import { AgentScopeRuntimeContentType, AgentScopeRuntimeMessageRole, AgentScopeRuntimeMessageType } from "../types";
import { useChatAnywhereInput } from "../../Context/ChatAnywhereInputContext";
import { emit } from "../../Context/useChatAnywhereEventEmitter";
import { useTranslation } from "../../Context/ChatAnywhereI18nContext";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    desc: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    font-size: 12px;\n    color: ", ";\n  "])), token.colorTextTertiary)
  };
});
export default function Approval(_ref2) {
  var data = _ref2.data;
  var inputContext = useChatAnywhereInput(function (v) {
    return v;
  });
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var _useTranslation = useTranslation(),
    t = _useTranslation.t;
  var _useState = useState('pending'),
    _useState2 = _slicedToArray(_useState, 2),
    status = _useState2[0],
    setStatus = _useState2[1];
  var title = (t === null || t === void 0 ? void 0 : t('approval.title')) || '人工干预';
  var description = useMemo(function () {
    if (status === 'pending') return (t === null || t === void 0 ? void 0 : t('approval.pending')) || '请确认是否执行该操作';
    if (status === 'confirmed') return (t === null || t === void 0 ? void 0 : t('approval.confirmed')) || '确认执行任务';
    return (t === null || t === void 0 ? void 0 : t('approval.canceled')) || '取消执行任务';
  }, [status, t]);
  var handleConfirm = useCallback(function (status, reason) {
    var _request$content$;
    setStatus(status);
    inputContext.setLoading(false);
    inputContext.setDisabled(false);
    var request = data;
    // @ts-ignore
    var id = (_request$content$ = request.content[0]) === null || _request$content$ === void 0 || (_request$content$ = _request$content$.data) === null || _request$content$ === void 0 ? void 0 : _request$content$.id;
    var response = {
      type: AgentScopeRuntimeMessageType.MCP_APPROVAL_RESPONSE,
      role: AgentScopeRuntimeMessageRole.USER,
      content: [{
        type: AgentScopeRuntimeContentType.DATA,
        data: {
          "approve": status === 'confirmed',
          "id": id,
          "approval_request_id": id,
          "reason": reason
        }
      }]
    };
    emit({
      type: 'handleApproval',
      data: {
        input: [request, response]
      }
    });
  }, [data]);
  var actions = useMemo(function () {
    if (status === 'pending') {
      return /*#__PURE__*/_jsxs(Flex, {
        gap: 8,
        children: [/*#__PURE__*/_jsx(ApprovalCancelPopover, {
          onConfirm: function onConfirm(reason) {
            return handleConfirm('canceled', reason);
          }
        }), /*#__PURE__*/_jsx(Button, {
          size: "small",
          type: "primary",
          onClick: function onClick() {
            return handleConfirm('confirmed');
          },
          children: (t === null || t === void 0 ? void 0 : t('approval.confirm')) || '确认执行'
        })]
      });
    }
    return null;
  }, [status, t]);
  useEffect(function () {
    if (status === 'pending') {
      inputContext.setLoading((t === null || t === void 0 ? void 0 : t('approval.taskRunning')) || '当前有正在执行的任务，无法发送新的任务');
      inputContext.setDisabled(true);
    }
  }, [status, t]);
  return /*#__PURE__*/_jsx(StatusCard.HITL, {
    done: status !== 'pending',
    onDone: function onDone() {},
    title: /*#__PURE__*/_jsxs(Flex, {
      gap: 8,
      children: [title, /*#__PURE__*/_jsx("span", {
        className: styles.desc,
        children: description
      })]
    }),
    actions: actions
  });
}