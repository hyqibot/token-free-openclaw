import React from 'react';
import cls from 'classnames';
import { useProviderContext } from "../../..";
import Style from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
var MediaInfo = function MediaInfo(props) {
  var className = props.className,
    title = props.title,
    description = props.description;
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('media-info');
  var showContent = !!title || !!description;
  if (!showContent) {
    return null;
  }
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsxs("div", {
      className: cls(prefixCls, className),
      children: [title && /*#__PURE__*/_jsx("div", {
        className: cls("".concat(prefixCls, "-title")),
        children: title
      }), description && /*#__PURE__*/_jsx("div", {
        className: cls("".concat(prefixCls, "-description")),
        children: description
      })]
    })]
  });
};
export default MediaInfo;