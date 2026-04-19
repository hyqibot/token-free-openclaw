function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { useGetState } from 'ahooks';
import React from "react";
import { createContext, useContextSelector } from 'use-context-selector';
import { jsx as _jsx } from "react/jsx-runtime";
export var ChatAnywhereMessagesContext = createContext({
  messages: [],
  setMessages: function setMessages() {},
  getMessages: function getMessages() {
    return [];
  }
});
export function ChatAnywhereMessagesContextProvider(props) {
  var _useGetState = useGetState([]),
    _useGetState2 = _slicedToArray(_useGetState, 3),
    messages = _useGetState2[0],
    setMessages = _useGetState2[1],
    getMessages = _useGetState2[2];
  var value = {
    messages: messages,
    setMessages: setMessages,
    getMessages: getMessages
  };
  return /*#__PURE__*/_jsx(ChatAnywhereMessagesContext.Provider, {
    value: value,
    children: props.children
  });
}
export var useChatAnywhereMessages = function useChatAnywhereMessages() {
  var _useContextSelector = useContextSelector(ChatAnywhereMessagesContext, function (v) {
      return {
        setMessages: v.setMessages,
        getMessages: v.getMessages
      };
    }),
    setMessages = _useContextSelector.setMessages,
    getMessages = _useContextSelector.getMessages;
  var removeAllMessages = React.useCallback(function () {
    setMessages([]);
  }, []);
  var getMessage = React.useCallback(function (id) {
    return getMessages().find(function (item) {
      return item.id === id;
    });
  }, []);
  var removeMessage = React.useCallback(function (message) {
    // @ts-ignore
    setMessages(function (prev) {
      return prev.filter(function (item) {
        return item.id !== message.id;
      });
    });
  }, []);
  var updateMessage = React.useCallback(function (message) {
    // @ts-ignore
    setMessages(function (prev) {
      var index = prev.findIndex(function (item) {
        return item.id === message.id;
      });
      if (index > -1) {
        var nextMessage = _objectSpread(_objectSpread({}, prev[index]), message);
        return [].concat(_toConsumableArray(prev.slice(0, index)), [nextMessage], _toConsumableArray(prev.slice(index + 1)));
      } else {
        return [].concat(_toConsumableArray(prev), [message]);
      }
    });
  }, []);
  return {
    getMessages: getMessages,
    removeAllMessages: removeAllMessages,
    getMessage: getMessage,
    removeMessage: removeMessage,
    updateMessage: updateMessage
  };
};