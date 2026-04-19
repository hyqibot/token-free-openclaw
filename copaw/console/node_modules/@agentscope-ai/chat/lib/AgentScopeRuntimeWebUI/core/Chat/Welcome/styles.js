var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-chat-anywhere-welcome-default {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  width: 100%;\n\n  &-greeting {\n   color: ", ";\n   font-size: 16px;\n   line-height: 26px;\n   font-weight: 500;\n  }\n\n  &-description {\n    color: ", ";\n    font-size: 12px;\n    line-height: 18px;\n  }\n  \n  &-prompts {\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n    margin-top: 10px;\n    width: 360px;\n    margin: 10px auto;\n  }\n\n  &-prompt {\n    height: 42px;\n    display: flex;\n    align-items: center;\n    background-color: ", ";\n    color: ", ";\n    font-size: 14px;\n    padding: 10px 16px;\n    border-radius: 8px;\n    cursor: pointer;\n    gap: 12px;\n\n    &-icon {\n      width: 20px;\n      height: 20px;\n    }\n\n    &-label {\n      flex: 1;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n    \n\n    &:hover {\n      background-color: ", ";\n    }\n    \n  }\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (_ref) {
  var theme = _ref.theme;
  return theme.colorText;
}, function (_ref2) {
  var theme = _ref2.theme;
  return theme.colorTextSecondary;
}, function (_ref3) {
  var theme = _ref3.theme;
  return theme.colorFillQuaternary;
}, function (_ref4) {
  var theme = _ref4.theme;
  return theme.colorText;
}, function (_ref5) {
  var theme = _ref5.theme;
  return theme.colorFillTertiary;
});