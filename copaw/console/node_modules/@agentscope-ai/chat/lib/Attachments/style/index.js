var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-attachment {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n\n  &,\n  * {\n    box-sizing: border-box;\n  }\n\n  &-drop-area {\n    position: absolute;\n    inset: 0;\n    z-index: ", "\n    box-sizing: border-box;\n\n    &,\n    * {\n      box-sizing: border-box;\n    }\n\n    &-on-body {\n      position: fixed;\n      inset: 0;\n    }\n\n    &-hide-placement {\n      .", "-attachment-placeholder-inner {\n        display: none;\n      }\n    }\n\n    .", "-attachment-placeholder {\n      padding: 0;\n    }\n  }\n\n  &-placeholder {\n    height: 100%;\n    border-radius: ", "px;\n    border-width: ", "px;\n    border-style: dashed;\n    border-color: transparent;\n    padding: ", "px;\n    position: relative;\n    backdrop-filter: blur(10px);\n    box-sizing: border-box;\n\n    &,\n    * {\n      box-sizing: border-box;\n    }\n\n    .", "-upload-wrapper .", "-upload.", "-upload-btn {\n      padding: 0;\n    }\n\n    &.", "-attachment-placeholder-drag-in {\n      border-color: ", ";\n    }\n\n    &.", "-attachment-placeholder-disabled {\n      opacity: 0.25;\n      pointer-events: none;\n    }\n\n    &-inner {\n      gap: calc(", "px / 2);\n    }\n\n    &-icon {\n      font-size: ", "px;\n      line-height: 1;\n    }\n\n    &-title.", "-attachment-placeholder-title {\n      margin: 0;\n      font-size: ", "px;\n      line-height: ", ";\n    }\n  }\n\n  &-list {\n    display: flex;\n    gap: ", "px;\n    font-size: ", "px;\n    line-height: ", ";\n    color: ", ";\n    width: 100%;\n    overflow: auto;\n    padding: ", "px;\n    padding-bottom: 0;\n\n    scrollbar-width: none;\n    -ms-overflow-style: none;\n    &::-webkit-scrollbar {\n      display: none;\n    }\n\n    &-overflow-scrollX,\n    &-overflow-scrollY {\n      &:before,\n      &:after {\n        content: \"\";\n        position: absolute;\n        opacity: 0;\n        z-index: 1;\n      }\n    }\n\n    &-overflow-ping-start:before {\n      opacity: 1;\n    }\n\n    &-overflow-ping-end:after {\n      opacity: 1;\n    }\n\n    &-overflow-scrollX {\n      overflow-x: auto;\n      overflow-y: hidden;\n      flex-wrap: nowrap;\n\n      &:before,\n      &:after {\n        inset-block: 0;\n        width: 8px;\n      }\n\n      &:before {\n        inset-inline-start: 0;\n        background: linear-gradient(to right, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0));\n      }\n\n      &:after {\n        inset-inline-end: 0;\n        background: linear-gradient(to left, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0));\n      }\n\n      &:dir(rtl) {\n        &:before {\n          background: linear-gradient(to left, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0));\n        }\n\n        &:after {\n          background: linear-gradient(to right, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0));\n        }\n      }\n    }\n\n    &-overflow-scrollY {\n      overflow-x: hidden;\n      overflow-y: auto;\n      max-height: calc(", "px * ", "px * 2 + ", "px + ", "px * 3);\n\n      &:before,\n      &:after {\n        inset-inline: 0;\n        height: 8px;\n      }\n\n      &:before {\n        inset-block-start: 0;\n        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0));\n      }\n\n      &:after {\n        inset-block-end: 0;\n        background: linear-gradient(to top, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0));\n      }\n    }\n\n    &-upload-btn {\n      width: calc(", "px * ", "px * 2 + ", "px + ", "px);\n      height: calc(", "px * ", "px * 2 + ", "px + ", "px);\n      font-size: ", "px;\n      color: #999;\n    }\n\n    &-prev-btn,\n    &-next-btn {\n      position: absolute;\n      top: 50%;\n      transform: translateY(-50%);\n      box-shadow: ", ";\n      opacity: 0;\n      pointer-events: none;\n    }\n\n    &-prev-btn {\n      left: ", "px;\n    }\n\n    &-next-btn {\n      right: ", "px;\n    }\n\n    &:dir(ltr) {\n      &.", "-attachment-list-overflow-ping-start .", "-attachment-list-prev-btn {\n        opacity: 1;\n        pointer-events: auto;\n      }\n\n      &.", "-attachment-list-overflow-ping-end .", "-attachment-list-next-btn {\n        opacity: 1;\n        pointer-events: auto;\n      }\n    }\n\n    &:dir(rtl) {\n      &.", "-attachment-list-overflow-ping-end .", "-attachment-list-prev-btn {\n        opacity: 1;\n        pointer-events: auto;\n      }\n\n      &.", "-attachment-list-overflow-ping-start .", "-attachment-list-next-btn {\n        opacity: 1;\n        pointer-events: auto;\n      }\n    }\n  }\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.zIndexPopupBase;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.borderRadius;
}, function (p) {
  return p.theme.lineWidthBold;
}, function (p) {
  return p.theme.padding;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorPrimaryHover;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.paddingXXS;
}, function (p) {
  return p.theme.fontSizeHeading2;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.fontSize;
}, function (p) {
  return p.theme.lineHeight;
}, function (p) {
  return p.theme.paddingSM;
}, function (p) {
  return p.theme.fontSize;
}, function (p) {
  return p.theme.lineHeight;
}, function (p) {
  return p.theme.colorText;
}, function (p) {
  return p.theme.padding;
}, function (p) {
  return p.theme.fontSize;
}, function (p) {
  return p.theme.lineHeight;
}, function (p) {
  return p.theme.paddingSM;
}, function (p) {
  return p.theme.paddingSM;
}, function (p) {
  return p.theme.fontSize;
}, function (p) {
  return p.theme.lineHeight;
}, function (p) {
  return p.theme.paddingSM;
}, function (p) {
  return p.theme.paddingSM;
}, function (p) {
  return p.theme.fontSize;
}, function (p) {
  return p.theme.lineHeight;
}, function (p) {
  return p.theme.paddingSM;
}, function (p) {
  return p.theme.paddingSM;
}, function (p) {
  return p.theme.fontSizeHeading2;
}, function (p) {
  return p.theme.boxShadowTertiary;
}, function (p) {
  return p.theme.padding;
}, function (p) {
  return p.theme.padding;
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
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
});