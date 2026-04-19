var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-chat-anywhere-sender-wrapper {\n  position: relative;\n\n  &-header {\n    display: flex;\n    gap: 8px;\n    margin-bottom: 12px;\n  }\n}\n\n.", "-chat-anywhere-sender-upload-hidden-nodes {\n    position: absolute;\n    z-index: -999;\n    top: -100vh;\n    left: -100vw;\n    width: 0;\n    height: 0;\n    overflow: hidden;\n  }\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
});