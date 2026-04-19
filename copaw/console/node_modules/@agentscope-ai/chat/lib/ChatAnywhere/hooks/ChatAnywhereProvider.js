function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _excluded = ["children"];
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
import React from 'react';
import { useGetState } from 'ahooks';
import { createContext, useContextSelector } from 'use-context-selector';
import { jsx as _jsx } from "react/jsx-runtime";
export function ChatAnywhereProvider(props) {
  var _useGetState = useGetState([]),
    _useGetState2 = _slicedToArray(_useGetState, 3),
    sessionList = _useGetState2[0],
    setSessionList = _useGetState2[1],
    getSessionList = _useGetState2[2];
  var _useGetState3 = useGetState('0'),
    _useGetState4 = _slicedToArray(_useGetState3, 3),
    currentSessionKey = _useGetState4[0],
    setCurrentSessionKey = _useGetState4[1],
    getCurrentSessionKey = _useGetState4[2];
  var _useGetState5 = useGetState(0),
    _useGetState6 = _slicedToArray(_useGetState5, 3),
    currentRegenerateIndex = _useGetState6[0],
    setCurrentRegenerateIndex = _useGetState6[1],
    getCurrentRegenerateIndex = _useGetState6[2];
  var _useGetState7 = useGetState([]),
    _useGetState8 = _slicedToArray(_useGetState7, 3),
    messages = _useGetState8[0],
    setMessages = _useGetState8[1],
    getMessages = _useGetState8[2];
  var _useGetState9 = useGetState(false),
    _useGetState10 = _slicedToArray(_useGetState9, 3),
    loading = _useGetState10[0],
    setLoading = _useGetState10[1],
    getLoading = _useGetState10[2];
  var _useGetState11 = useGetState(false),
    _useGetState12 = _slicedToArray(_useGetState11, 3),
    disabled = _useGetState12[0],
    setDisabled = _useGetState12[1],
    getDisabled = _useGetState12[2];
  var _useGetState13 = useGetState(true),
    _useGetState14 = _slicedToArray(_useGetState13, 3),
    sessionListShow = _useGetState14[0],
    setSessionListShow = _useGetState14[1],
    getSessionListShow = _useGetState14[2];
  var children = props.children,
    rest = _objectWithoutProperties(props, _excluded);
  var value = _objectSpread({
    sessionList: sessionList,
    setSessionList: setSessionList,
    getSessionList: getSessionList,
    currentSessionKey: currentSessionKey,
    setCurrentSessionKey: setCurrentSessionKey,
    getCurrentSessionKey: getCurrentSessionKey,
    messages: messages,
    setMessages: setMessages,
    getMessages: getMessages,
    loading: loading,
    setLoading: setLoading,
    getLoading: getLoading,
    disabled: disabled,
    setDisabled: setDisabled,
    getDisabled: getDisabled,
    sessionListShow: sessionListShow,
    setSessionListShow: setSessionListShow,
    getSessionListShow: getSessionListShow,
    currentRegenerateIndex: currentRegenerateIndex,
    setCurrentRegenerateIndex: setCurrentRegenerateIndex,
    getCurrentRegenerateIndex: getCurrentRegenerateIndex
  }, rest);
  return /*#__PURE__*/_jsx(ChatAnywhereContext.Provider, {
    value: value,
    children: children
  });
}
export var ChatAnywhereContext = createContext(undefined);
export function useChatAnywhere(selector) {
  try {
    var context = useContextSelector(ChatAnywhereContext, selector);
    return context;
  } catch (error) {
    return {};
  }
}
;
;