import React from "react";
import { useProviderContext } from "../Provider";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export default function (props) {
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('accordion-content-body');
  return /*#__PURE__*/_jsxs("div", {
    className: prefixCls,
    children: [props.headerLeft || props.headerRight ? /*#__PURE__*/_jsxs("div", {
      className: "".concat(prefixCls, "-header"),
      children: [props.headerLeft, /*#__PURE__*/_jsx("div", {
        style: {
          flex: 1
        }
      }), props.headerRight]
    }) : null, /*#__PURE__*/_jsx("div", {
      className: "".concat(prefixCls, "-body"),
      children: props.children
    })]
  });
}