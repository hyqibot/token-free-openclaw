var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-accordion-group {\n  width: 100%;\n\n  svg {\n    transform: scale(1.25);\n  }\n  \n  .anticon-spin::before,\n  .anticon-spin {\n    animation-duration: 2s;\n  }\n\n  &-icon-success {\n    color: ", ";\n  }\n\n  @keyframes ", "-loading {\n    0% {\n      transform: rotate(0deg);\n    }\n    100% {\n      transform: rotate(360deg);\n    }\n  }\n\n  &-icon-error {\n    color: ", ";\n  }\n\n  &-header {\n    display: flex;\n    align-items: center;\n    gap: 4px;\n    color: ", ";\n    padding: 6px 12px;\n    font-size: 12px;\n    cursor: pointer;\n    line-height: 20px;\n    background-color: ", ";\n\n    &-arrow {\n      display: flex;\n      align-items: center;\n    }\n\n    &-close {\n      border-radius: ", "px;\n      border: 1px solid ", ";\n      display: inline-flex;\n    }\n\n    &-icon {\n      position: relative;\n      display: flex;\n      width: 16px;\n      height: 16px;\n      align-items: center;\n      justify-content: center;\n      font-size: 14px;\n\n      &-line {\n        &::before,\n        &::after {\n          content: '';\n          position: absolute;\n          width: 1px;\n          height: 7px;\n          background-color: ", ";\n          left: 50%;\n          transform: translateX(-50%);\n        }\n\n        &::before {\n          top: -9px;\n        }\n\n        &::after {\n          bottom: -9px;\n        }\n      }\n\n      &-last::after {\n        content: none;\n      }\n\n      &-first::before {\n        content: none;\n      }\n    }\n  }\n\n  &-open {\n    overflow: hidden;\n    border-radius: 8px;\n    border: 1px solid ", ";\n    background-color: ", ";\n  }\n\n  &-body {\n    margin: 8px;\n    color: ", ";\n    font-size: 12px;\n    border-radius: 8px;\n    overflow: hidden;\n\n    .", "-accordion-group-header {\n      background-color: transparent;\n    }\n\n    \n\n    .", "-accordion-group-header-close,\n    .", "-accordion-group-open {\n      border: 0;\n    }\n\n    .", "-accordion-group-header-close {\n      display: flex;\n    }\n\n    &-inline {\n      padding: 8px 0;\n      margin: 0;\n      background-color: transparent;\n    }\n\n    > .", "-accordion-group {\n      background-color: ", ";\n\n      &-open {\n        border-radius: 0;\n      }\n    }\n\n    &-close {\n      height: 0;\n      padding: 0;\n      margin: 0;\n    }\n  }\n}\n\n.", "-accordion-deep-thinking {\n  font-size: 12px;\n  color: ", ";\n  text-align: left;\n  white-space: pre-wrap;\n  line-height: 20px;\n  padding: 0 12px;\n  border-left: 1px solid ", ";\n}\n\n.", "-accordion-soft-light-title {\n  font-size: 12px;\n  position: relative;\n  display: inline-block;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  mask-image: linear-gradient(\n    270deg,\n    rgba(231, 231, 237, 0.88) 20%,\n    rgba(231, 231, 237, 0.5) 50%,\n    rgba(255, 255, 255, 0.4) 52%,\n    rgba(231, 231, 237, 0.5) 70%,\n    rgba(231, 231, 237, 0.88) 80%\n  );\n  mask-size: 200% 100%;\n  animation: softlight-text 3s linear infinite;\n}\n\n\n@keyframes softlight-text {\n  0% {\n    mask-position: 100% 0;\n  }\n\n  100% {\n    mask-position: -100% 0;\n  }\n}\n\n.", "-accordion-content-body {\n  border: 1px solid ", ";\n  border-radius: 8px;\n  overflow: hidden;\n  &-header {\n    display: flex;\n    height: 24px;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0 12px;\n    border-bottom: 1px solid ", ";\n    background-color: ", ";\n    color: ", ";\n  }\n\n  &-body {\n    background-color: ", ";\n  }\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorSuccess;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorError;
}, function (p) {
  return p.theme.colorTextSecondary;
}, function (p) {
  return p.theme.colorBgBase;
}, function (p) {
  return p.theme.borderRadiusLG;
}, function (p) {
  return p.theme.colorBorderSecondary;
}, function (p) {
  return p.theme.colorBorder;
}, function (p) {
  return p.theme.colorBorderSecondary;
}, function (p) {
  return p.theme.colorBgBase;
}, function (p) {
  return p.theme.colorText;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorFillTertiary;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorTextSecondary;
}, function (p) {
  return p.theme.colorBorderSecondary;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorBorderSecondary;
}, function (p) {
  return p.theme.colorBorderSecondary;
}, function (p) {
  return p.theme.colorFillTertiary;
}, function (p) {
  return p.theme.colorText;
}, function (p) {
  return p.theme.colorBgBase;
});