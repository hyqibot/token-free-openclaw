var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n\n.", "-chat-anywhere-default-header {\n  &-inner {\n    flex-direction: row-reverse;\n    gap: 10px;\n    padding: 0;\n  }\n\n  &-right {\n    margin: 0 0 0 auto;\n  }\n}\n\n.", "-chat-anywhere-default-header-sessions {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 10px 0 10px 0;\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
});