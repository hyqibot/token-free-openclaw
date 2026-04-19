var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
var Style = createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-bubble-footer {\n  width: 100%;\n  margin-top: 8px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  font-size: 12px;\n  overflow: hidden;\n}\n\n.", "-bubble-footer-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n\n  &-item {\n    cursor: pointer;\n    color: ", "\n  }\n}\n\n.", "-bubble-footer-count {\n  display: flex;\n  align-items: center;\n\n  &-item {\n    color: ", ";\n    line-height: 1;\n    padding-right: 13px;\n    margin-left: 13px;\n    border-right: 1px solid ", ";\n    white-space: nowrap;\n\n    &:last-of-type {\n      padding-right: 0;\n      border-right: 0;\n    }\n  }\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorText;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorTextTertiary;
}, function (p) {
  return p.theme.colorBorder;
});
export default Style;