var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { createGlobalStyle } from 'antd-style';
export default createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-assets-preview {\n  position: relative;\n\n  &-left-edge,\n  &-right-edge {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    width: 128px;\n    pointer-events: none;\n  }\n\n  &-left-edge {\n    left: 0;\n    background: linear-gradient(to right, ", ", rgba(0, 0, 0, 0));\n  }\n\n  &-right-edge {\n    right: 0;\n    background: linear-gradient(to left, ", ", rgba(0, 0, 0, 0));\n  }\n\n  &-arrow {\n    position: absolute;\n    bottom: 0;\n  }\n\n  &-left-arrow {\n    left: 10px;\n  }\n\n  &-right-arrow {\n    right: 10px;\n  }\n\n  &-container {\n    display: flex;\n    padding: 8px;\n    gap: 8px;\n    overflow-x: auto;\n    justify-content: safe center;\n    background-color: ", ";\n    scrollbar-width: none; /* Firefox */\n    -ms-overflow-style: none; /* IE/Edge */\n    &::-webkit-scrollbar {\n      display: none; /* Chrome/Safari/Opera */\n    }\n  }\n\n\n  &-image {\n    height: 100%;\n    flex-basis: auto;\n    flex-shrink: 0;\n    border-radius: 8px;\n    overflow: hidden;\n    background-size: cover;\n    background-position: center;\n    background-repeat: no-repeat;\n\n    .anticon-eye {\n      font-size: 20px;\n      margin: 0 !important;\n    }\n  }\n\n  &-video {\n    height: 100%;\n    flex-basis: auto;\n    flex-shrink: 0;\n    border-radius: 8px;\n    overflow: hidden;\n    position: relative;\n    cursor: pointer;\n\n    &-enlarge {\n      display: none;\n      position: absolute;\n      top: 6px;\n      right: 6px;\n      z-index: 1;\n      border-radius: 4px;\n      background-color: ", ";\n\n      button {\n        display: flex;\n      }\n    }\n\n    video {\n      width: 100%;\n      height: 100%;\n      object-fit: cover;\n\n      &:fullscreen {\n        object-fit: contain;\n      }\n\n      &:-webkit-full-screen {\n        object-fit: contain;\n      }\n\n      &:-moz-full-screen {\n        object-fit: contain;\n      }\n    }\n\n    &-overlay {\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      border-radius: 8px;\n\n      &:hover {\n        .", "-assets-preview-video-enlarge {\n          display: block;\n        }\n      }\n\n      &-playing {\n        opacity: 0;\n        &:hover {\n          opacity: 1;\n          background: linear-gradient(180deg, rgba(111, 111, 111, 0.27) 0%, rgba(38, 36, 76, 0.83) 100%);\n        }\n      }\n\n      &-paused {\n        background: linear-gradient(180deg, rgba(111, 111, 111, 0.27) 0%, rgba(38, 36, 76, 0.83) 100%);\n      }\n    }\n\n    &-play-btn {\n      width: 40px;\n      height: 40px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      color: #fff;\n      transition: transform 0.2s ease;\n      font-size: 40px;\n      \n\n      &:hover {\n        transform: scale(1.1);\n      }\n    }\n\n    &-duration {\n      position: absolute;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      bottom: 8px;\n      left: 0px;\n      height: 28px;\n      bottom: 0;\n      right: 0;\n      font-size: 14px;\n      font-weight: 500;\n      color: #fff;\n      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);\n      background: linear-gradient(180deg, rgba(111, 111, 111, 0.27) 0%, rgba(38, 36, 76, 0.83) 100%);\n    }\n\n    &-overlay {\n      &:hover {\n        ~ .", "-assets-preview-video-duration {\n          background: transparent;\n        }\n      }\n    }\n\n    &-playing-overlay {\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      bottom: 0;\n    }\n  }\n    \n  &-audio {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    background-color: ", ";\n    border-radius: 8px;\n    border: 1px solid ", ";\n    height: 40px;\n    padding: 0 8px;\n\n    &-time {\n      font-size: 12px;\n      color: ", ";\n      line-height: 1;\n    }\n\n    &-progress {\n      flex: 1;\n      height: 8px;\n      background-color: ", ";\n      border-radius: 4px;\n      cursor: pointer;\n      position: relative;\n      overflow: hidden;\n\n      &-bar {\n        height: 100%;\n        background-color: ", ";\n        border-radius: 4px;\n        transition: width 0.1s linear;\n      }\n    }\n  }\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorBgLayout;
}, function (p) {
  return p.theme.colorBgLayout;
}, function (p) {
  return p.theme.colorFillTertiary;
}, function (p) {
  return p.theme.colorBgBase;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.colorBgBase;
}, function (p) {
  return p.theme.colorBorderSecondary;
}, function (p) {
  return p.theme.colorText;
}, function (p) {
  return p.theme.colorBorderSecondary;
}, function (p) {
  return p.theme.colorPrimary;
});