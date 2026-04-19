var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
import { useProviderContext } from "./..";
import { SparkErrorCircleFill, SparkStopCircleLine } from '@agentscope-ai/icons';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
var Style = createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-interrupted {\n  display: inline-flex;\n  flex-direction: column;\n  font-size: 12px;\n  font-weight: 500;\n  line-height: 18px;\n  letter-spacing: 0px;\n  background-color: ", ";\n  padding: 10px 12px;\n  border-radius: 8px;\n  gap: 8px;\n}\n.", "-interrupted-desc {\n  font-weight: normal;\n  word-break: break-word;\n}\n\n.", "-interrupted-header {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  color: ", ";\n\n  &-icon-wrapper {\n    width: 16px;\n    height: 16px;\n    flex: 0 0 16px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n\n  &-error {\n    color: ", ";\n    font-size: 16px;\n  }\n\n  &-interrupted {\n    font-size: 16px;\n  }\n  \n}\n\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorFillSecondary;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorText;
}, function (p) {
  return p.theme.colorError;
});
export default function Interrupted(props) {
  var _props$title = props.title,
    title = _props$title === void 0 ? 'Answers have stopped' : _props$title,
    _props$type = props.type,
    type = _props$type === void 0 ? 'interrupted' : _props$type,
    desc = props.desc;
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('interrupted');
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsxs("div", {
      className: "".concat(prefixCls),
      children: [/*#__PURE__*/_jsxs("div", {
        className: "".concat(prefixCls, "-header"),
        children: [/*#__PURE__*/_jsx("div", {
          className: "".concat(prefixCls, "-icon-wrapper"),
          children: type === 'interrupted' ? /*#__PURE__*/_jsx(SparkStopCircleLine, {
            className: "".concat(prefixCls, "-header-interrupted")
          }) : /*#__PURE__*/_jsx(SparkErrorCircleFill, {
            className: "".concat(prefixCls, "-header-error")
          })
        }), /*#__PURE__*/_jsx("span", {
          children: title
        })]
      }), desc && /*#__PURE__*/_jsx("div", {
        className: "".concat(prefixCls, "-desc"),
        children: desc
      })]
    })]
  });
}