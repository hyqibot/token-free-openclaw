import React from 'react';
import { useProviderContext } from "./..";
import { IconButton } from '@agentscope-ai/design';
import Style from "./style/footer";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
export default function Footer(props) {
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('bubble-footer');
  var left = props.left,
    right = props.right;
  if (left && !left.type || right && !right.type) return null;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsxs("div", {
      className: prefixCls,
      children: [/*#__PURE__*/_jsx("div", {
        className: "".concat(prefixCls, "-left"),
        children: props.left
      }), /*#__PURE__*/_jsx("div", {
        className: "".concat(prefixCls, "-right"),
        children: props.right
      })]
    })]
  });
}
export function FooterActions(props) {
  var _useProviderContext2 = useProviderContext(),
    getPrefixCls = _useProviderContext2.getPrefixCls;
  var prefixCls = getPrefixCls('bubble-footer-actions');
  return /*#__PURE__*/_jsx("div", {
    className: prefixCls,
    children: props.data.map(function (item, index) {
      if (item.children) {
        return /*#__PURE__*/React.cloneElement(item.children, {
          key: index
        });
      } else {
        return /*#__PURE__*/_jsx(IconButton, {
          bordered: false,
          icon: item.icon,
          size: "small",
          onClick: item.onClick
        }, index);
      }
    })
  });
}
;
export function FooterCount(props) {
  var _useProviderContext3 = useProviderContext(),
    getPrefixCls = _useProviderContext3.getPrefixCls;
  var prefixCls = getPrefixCls('bubble-footer-count');
  return /*#__PURE__*/_jsx("div", {
    className: prefixCls,
    children: props.data.map(function (item) {
      return /*#__PURE__*/_jsxs("div", {
        className: "".concat(prefixCls, "-item"),
        children: [item[0], "\uFF1A", item[1]]
      }, item[0]);
    })
  });
}
Footer.Actions = FooterActions;
Footer.Count = FooterCount;