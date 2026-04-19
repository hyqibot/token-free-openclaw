var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8;
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { Button, Input, Popover } from '@agentscope-ai/design';
import { Flex } from 'antd';
import { useState } from 'react';
import { createStyles } from 'antd-style';
import { useTranslation } from "../../Context/ChatAnywhereI18nContext";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    width: 386px;\n  "]))),
    title: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    font-size: 14px;\n    font-weight: 500;\n    color: ", ";\n    margin-bottom: 16px;\n  "])), token.colorText),
    content: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n  "]))),
    tabsContainer: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n    display: flex;\n    flex-wrap: wrap;\n    gap: 8px;\n  "]))),
    tabItem: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n    padding: 0 8px;\n    font-size: 14px;\n    color: ", ";\n    cursor: pointer;\n    border: 1px solid ", ";\n    background: ", ";\n    transition: all 0.2s;\n    user-select: none;\n    border-radius: 4px;\n  "])), token.colorText, token.colorBorderSecondary, token.colorBgContainer),
    tabItemSelected: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n    color: ", ";\n    border-color: ", ";\n    border: 1px solid ", ";\n    position: relative;\n    z-index: 1;\n  "])), token.colorPrimary, token.colorPrimary, token.colorPrimary),
    textarea: css(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n    resize: none;\n  "]))),
    actions: css(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n    display: flex;\n    justify-content: flex-end;\n    gap: 8px;\n  "])))
  };
});
function useDefaultOptions() {
  var _useTranslation = useTranslation(),
    t = _useTranslation.t;
  return [(t === null || t === void 0 ? void 0 : t('cancelPopover.options.notNeeded')) || '不需要', (t === null || t === void 0 ? void 0 : t('cancelPopover.options.poorResult')) || '效果不理想', (t === null || t === void 0 ? void 0 : t('cancelPopover.options.tooSlow')) || '等待时间久', (t === null || t === void 0 ? void 0 : t('cancelPopover.options.wrongInput')) || '输入错误'];
}
function TabSelect(props) {
  var options = props.options;
  var _useState = useState(),
    _useState2 = _slicedToArray(_useState, 2),
    value = _useState2[0],
    setValue = _useState2[1];
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx("div", {
    className: styles.tabsContainer,
    children: options.map(function (option) {
      return /*#__PURE__*/_jsx("div", {
        className: "".concat(styles.tabItem, " ").concat(value === option ? styles.tabItemSelected : ''),
        onClick: function onClick() {
          setValue(option);
          props.onSelect(option);
        },
        children: option
      }, option);
    })
  });
}
export default function ApprovalCancelPopover(props) {
  var _useTranslation2 = useTranslation(),
    t = _useTranslation2.t;
  var defaultOptions = useDefaultOptions();
  var _props$options = props.options,
    options = _props$options === void 0 ? defaultOptions : _props$options,
    onConfirm = props.onConfirm,
    _props$title = props.title,
    title = _props$title === void 0 ? (t === null || t === void 0 ? void 0 : t('cancelPopover.title')) || '取消原因' : _props$title,
    _props$placeholder = props.placeholder,
    placeholder = _props$placeholder === void 0 ? (t === null || t === void 0 ? void 0 : t('cancelPopover.placeholder')) || '请输入原因，以便大模型做进一步规划' : _props$placeholder;
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    open = _useState4[0],
    setOpen = _useState4[1];
  var _useStyles2 = useStyles(),
    styles = _useStyles2.styles;
  var _useState5 = useState(''),
    _useState6 = _slicedToArray(_useState5, 2),
    reason = _useState6[0],
    setReason = _useState6[1];
  var handleConfirm = function handleConfirm() {
    onConfirm === null || onConfirm === void 0 || onConfirm(reason.trim());
  };
  var content = /*#__PURE__*/_jsxs("div", {
    className: styles.container,
    children: [/*#__PURE__*/_jsx("div", {
      className: styles.title,
      children: title
    }), /*#__PURE__*/_jsxs("div", {
      className: styles.content,
      children: [/*#__PURE__*/_jsx(TabSelect, {
        options: options,
        onSelect: setReason
      }), /*#__PURE__*/_jsx(Input.TextArea, {
        className: styles.textarea,
        value: reason,
        onChange: function onChange(e) {
          return setReason(e.target.value);
        },
        placeholder: placeholder,
        rows: 3
      }), /*#__PURE__*/_jsxs(Flex, {
        className: styles.actions,
        children: [/*#__PURE__*/_jsx(Button, {
          size: "small",
          onClick: function onClick() {
            return setOpen(false);
          },
          children: (t === null || t === void 0 ? void 0 : t('cancelPopover.cancel')) || '取消'
        }), /*#__PURE__*/_jsx(Button, {
          size: "small",
          type: "primary",
          onClick: function onClick() {
            setOpen(false);
            handleConfirm();
          },
          children: (t === null || t === void 0 ? void 0 : t('cancelPopover.confirm')) || '确认'
        })]
      })]
    })]
  });
  return /*#__PURE__*/_jsx(Popover, {
    open: open,
    onOpenChange: setOpen,
    trigger: "click",
    content: content,
    children: /*#__PURE__*/_jsx(Button, {
      size: "small",
      children: (t === null || t === void 0 ? void 0 : t('approval.cancel')) || '取消执行'
    })
  });
}