import { useChatAnywhereOptions } from "../Context/ChatAnywhereOptionsContext";
import { InnerHeader, InnerList, InnerAdder } from "../Sessions";
import { useProviderContext } from "../../..";
import Style from "./styles";
import { useContext } from "react";
import { Drawer } from 'antd';
import { ChatAnyWhereLayoutContext } from "../Context/ChatAnywhereLayoutContext";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
export default function Header() {
  var prefixCls = useProviderContext().getPrefixCls('chat-anywhere');
  var _useChatAnywhereOptio = useChatAnywhereOptions(function (v) {
      return v.theme;
    }),
    narrowMode = _useChatAnywhereOptio.narrowMode,
    rightHeader = _useChatAnywhereOptio.rightHeader;
  var _useContext = useContext(ChatAnyWhereLayoutContext),
    toggleCollapsed = _useContext.toggleCollapsed,
    collapsed = _useContext.collapsed;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsxs("div", {
      className: "".concat(prefixCls, "-layout-right-header"),
      children: [narrowMode ? /*#__PURE__*/_jsx(InnerHeader, {
        className: "".concat(prefixCls, "-default-header-inner")
      }) : null, rightHeader && /*#__PURE__*/_jsx("div", {
        className: "".concat(prefixCls, "-default-header-right"),
        children: rightHeader
      })]
    }), narrowMode && /*#__PURE__*/_jsx(Drawer, {
      width: "80vw",
      styles: {
        body: {
          padding: 0
        }
      },
      open: collapsed,
      onClose: toggleCollapsed,
      title: null,
      closable: false,
      placement: "left",
      children: /*#__PURE__*/_jsxs("div", {
        className: "".concat(prefixCls, "-sessions"),
        children: [/*#__PURE__*/_jsx(InnerList, {
          narrowMode: true
        }), /*#__PURE__*/_jsx(InnerAdder, {
          narrowMode: true
        })]
      })
    })]
  });
}