function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React, { useEffect } from 'react';
import classnames from 'classnames';
import { useProviderContext } from "../..";
import { Drawer } from 'antd';
import { useResponsive } from 'ahooks';
import { useChatAnywhere } from "../hooks/ChatAnywhereProvider";
import Style from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
function Left(props) {
  var _useChatAnywhere = useChatAnywhere(function (v) {
      return {
        sessionListShow: v.sessionListShow,
        setSessionListShow: v.setSessionListShow
      };
    }),
    sessionListShow = _useChatAnywhere.sessionListShow,
    setSessionListShow = _useChatAnywhere.setSessionListShow;
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('chat-anywhere-layout');
  var isMobile = isMobileHook();
  useEffect(function () {
    setSessionListShow(!isMobile);
  }, [isMobile]);
  if (!props.left) return null;
  if (!isMobile) return /*#__PURE__*/_jsx("div", {
    className: classnames("".concat(prefixCls, "-left"), sessionListShow ? '' : "".concat(prefixCls, "-left-hide")),
    children: props.left
  });
  return /*#__PURE__*/_jsx(Drawer, {
    width: "80vw",
    styles: {
      body: {
        padding: 0
      }
    },
    open: sessionListShow,
    onClose: function onClose() {
      setSessionListShow(false);
    },
    title: null,
    closable: false,
    placement: "left",
    children: /*#__PURE__*/_jsx("div", {
      style: {
        display: 'flex',
        flexDirection: 'column'
      },
      children: props.left
    })
  });
}
export default function (props) {
  var _useProviderContext2 = useProviderContext(),
    getPrefixCls = _useProviderContext2.getPrefixCls;
  var prefixCls = getPrefixCls('chat-anywhere-layout');
  var uiConfig = useChatAnywhere(function (state) {
    return state.uiConfig;
  });
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsx("div", {
      className: prefixCls,
      children: /*#__PURE__*/_jsxs("div", {
        className: "".concat(prefixCls, "-main"),
        children: [/*#__PURE__*/_jsx(Left, _objectSpread({}, props)), /*#__PURE__*/_jsxs("div", {
          className: "".concat(prefixCls, "-right"),
          style: {
            background: uiConfig === null || uiConfig === void 0 ? void 0 : uiConfig.background
          },
          children: [props.top, props.right]
        })]
      })
    })]
  });
}
export var isMobileHook = function isMobileHook() {
  var responsive = useResponsive();
  var uiConfig = useChatAnywhere(function (state) {
    return state.uiConfig;
  });
  return !responsive.md || (uiConfig === null || uiConfig === void 0 ? void 0 : uiConfig.narrowScreen);
};