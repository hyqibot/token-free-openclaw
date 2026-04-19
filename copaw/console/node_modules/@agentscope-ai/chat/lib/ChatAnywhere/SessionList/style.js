var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-chat-anywhere-session-list {\n  display: flex;\n  flex-direction: column;\n  height: 0;\n  flex: 1;\n  width: 100%;\n\n  .", "-conversations {\n    height: 100%;\n  }\n\n  &-session { \n    height: 0;\n    flex: 1;\n    padding: 8px 20px;\n\n  }\n\n  &-logo {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0 20px;\n    height: 64px;\n  }\n\n  &-adder {\n    padding: 0 20px 8px 20px;\n    button {\n      border-radius: 6px;\n      box-shadow: 15px 0px 30px -10px rgba(131, 88, 246, 0.4),\n        0px 0px 30px -10px rgba(255, 142, 168, 0.4),\n        -15px 0px 30px -10px rgba(225, 163, 37, 0.4);\n    }\n  }\n\n  &-hide {\n    .", "-chat-anywhere-session-list-adder-logo > div {\n      opacity: 0;\n    }\n    .", "-chat-anywhere-session-list-adder {\n      opacity: 0;\n    }\n    .", "-chat-anywhere-session-list-session {\n      opacity: 0;\n    }\n  }\n}\n\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
});