var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-media-info {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n\n  /* \u6807\u9898 */\n  &-title {\n    font-size: 12px;\n    font-weight: 500;\n    line-height: 20px;\n    color: ", ";\n  }\n\n  /* \u63CF\u8FF0 */\n  &-description {\n    font-size: 12px;\n    line-height: 20px;\n    color: ", ";\n  }\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorText;
}, function (p) {
  return p.theme.colorTextTertiary;
});