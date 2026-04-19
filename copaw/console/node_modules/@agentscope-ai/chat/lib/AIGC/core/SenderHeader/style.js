var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-aigc-sender-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  height: 90px;\n  padding: 12px;\n  border-bottom: 1px dashed ", ";\n\n  .", "-aigc-sender-header-upload-hidden {\n    overflow: hidden;\n    opacity: 0;\n    width: 0;\n    height: 0;\n    margin-left: -8px;\n  }\n\n  .", "-attachment {\n    width: fit-content;\n  }\n\n  .", "-attachment-list {\n    padding: 0;\n  }\n\n  .", "-attachment-list-card-type-preview {\n    width: 100px;\n    height: 64px;\n  }\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorBorderSecondary;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
});