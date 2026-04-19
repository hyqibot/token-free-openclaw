var _templateObject;
function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
import { Space } from 'antd';
import React from 'react';
import { Attachments } from "../..";
import { createGlobalStyle } from 'antd-style';
import { useProviderContext } from "../..";
import { SparkDownloadLine } from '@agentscope-ai/icons';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
var Style = createGlobalStyle(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n.", "-bubble-files-file {\n  position: relative;\n}\n\n.", "-bubble-files-download {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(0,0,0,0.5);\n  z-index: 1;\n  opacity: 0;\n  font-size: 16px;\n  border-radius: ", "px;\n  cursor: pointer;\n  color: ", ";\n  transition: opacity ", "\n\n}\n\n.", "-bubble-files-file:hover .", "-bubble-files-download {\n  opacity: 1;\n}\n"])), function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.borderRadius;
}, function (p) {
  return p.theme.colorWhite;
}, function (p) {
  return p.theme.motionDurationSlow;
}, function (p) {
  return p.theme.prefixCls;
}, function (p) {
  return p.theme.prefixCls;
});
export default function Files(props) {
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('bubble-files');
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsx(Space, {
      className: prefixCls,
      children: props.data.map(function (file, index) {
        var fileInfo = {
          name: file.name || file.filename,
          size: file.size || file.bytes,
          url: file.url
        };
        return /*#__PURE__*/_jsxs("div", {
          className: "".concat(prefixCls, "-file"),
          children: [/*#__PURE__*/_jsx(Attachments.FileCard, {
            // @ts-ignore
            item: fileInfo
          }), fileInfo.url && /*#__PURE__*/_jsx("div", {
            className: "".concat(prefixCls, "-download"),
            onClick: function onClick() {
              window.open(fileInfo.url, '_blank');
            },
            children: /*#__PURE__*/_jsx(SparkDownloadLine, {})
          })]
        }, index);
      })
    })]
  });
}