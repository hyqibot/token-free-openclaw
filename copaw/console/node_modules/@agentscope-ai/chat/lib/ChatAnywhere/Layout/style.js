var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n\n.", "-chat-anywhere-layout {\n  *::-webkit-scrollbar {\n    display: none;\n  }\n  font-family: ", ";\n  overflow: hidden;\n  position: relative;\n  height: 100%;\n  background: ", ";\n\n  &-main {\n    display: flex;\n    height: 100%;\n    background: ", ";\n  }\n\n  &-left {\n    display: flex;\n    flex-direction: column;\n    height: 100vh;\n    box-sizing: border-box;\n    background-color: ", ";\n    width: 240px;\n    transition: all 0.2s;\n\n    &-hide {\n      margin-left: -168px;\n      background-color: transparent;\n    }\n  }\n\n  &-right {\n    position: relative;\n    width: 0;\n    flex: 1;\n    box-sizing: border-box;\n    background: ", ";\n  }\n}\n\n\n\n\n*[data-tauri-drag-region] {\n  -webkit-app-region: drag;\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.fontFamily;
}, function (p) {
  return p.theme.colorBgBase;
}, function (p) {
  return p.theme.colorBgBase;
}, function (p) {
  return p.theme.colorBgBase;
}, function (p) {
  return p.theme.colorFillTertiary;
});