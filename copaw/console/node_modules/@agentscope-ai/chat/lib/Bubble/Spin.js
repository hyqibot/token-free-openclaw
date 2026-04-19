import { useProviderContext } from "./..";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export default function () {
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('bubble-loading');
  return /*#__PURE__*/_jsxs("div", {
    className: prefixCls,
    children: [/*#__PURE__*/_jsx("div", {
      className: "".concat(prefixCls, "-dot1")
    }), /*#__PURE__*/_jsx("div", {
      className: "".concat(prefixCls, "-dot2")
    }), /*#__PURE__*/_jsx("div", {
      className: "".concat(prefixCls, "-dot3")
    }), /*#__PURE__*/_jsx("div", {
      className: "".concat(prefixCls, "-text"),
      children: "-"
    })]
  });
}