function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _excluded = ["cardConfig"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import React, { forwardRef, useRef, useState } from 'react';
import Layout from "./Layout";
import SessionList from "./SessionList";
import Chat from "./Chat";
import Header from "./Header";
import { v4 as uuid } from 'uuid';
import { CustomCardsProvider } from "./..";
import { ChatAnywhereProvider, useChatAnywhere } from "./hooks/ChatAnywhereProvider";
import ContextRef from "./Chat/Ref";
import { useMessages } from "./hooks/useMessages";
import { useInput } from "./hooks/useInput";
import { useSessionList } from "./hooks/useSessionList";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { createElement as _createElement } from "react";
export { uuid, useChatAnywhere, useMessages, useInput, useSessionList };
export default /*#__PURE__*/forwardRef(function (chatanywhereConfig, ref) {
  var _rest$uiConfig;
  var _useState = useState(0),
    _useState2 = _slicedToArray(_useState, 2),
    key = _useState2[0],
    setKey = _useState2[1];
  var cardConfig = chatanywhereConfig.cardConfig,
    rest = _objectWithoutProperties(chatanywhereConfig, _excluded);
  var chatRef = useRef(null);
  var inputRef = useRef(null);
  var contextRef = useRef(null);
  React.useImperativeHandle(ref, function () {
    return _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, chatRef.current), inputRef.current), contextRef.current), {}, {
      reload: function reload() {
        setKey(function (key) {
          return key + 1;
        });
      }
    });
  });
  return /*#__PURE__*/_createElement(ChatAnywhereProvider, _objectSpread(_objectSpread({}, rest), {}, {
    key: key
  }), /*#__PURE__*/_jsxs(CustomCardsProvider, {
    cardConfig: cardConfig,
    children: [/*#__PURE__*/_jsx(Layout, {
      top: (_rest$uiConfig = rest.uiConfig) !== null && _rest$uiConfig !== void 0 && _rest$uiConfig.header ? /*#__PURE__*/_jsx(Header, {}) : null,
      left: rest.onSessionKeyChange ? /*#__PURE__*/_jsx(SessionList, {}) : null
      // @ts-ignore
      ,
      right: /*#__PURE__*/_jsx(Chat, {
        ref: {
          chatRef: chatRef,
          inputRef: inputRef
        }
      })
    }), /*#__PURE__*/_jsx(ContextRef, {
      ref: contextRef
    })]
  }));
});