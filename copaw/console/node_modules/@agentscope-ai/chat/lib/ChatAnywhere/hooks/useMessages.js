function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React from 'react';
import { useChatAnywhere } from "./ChatAnywhereProvider";
export function useMessages() {
  var _useChatAnywhere = useChatAnywhere(function (v) {
      return {
        messages: v.messages,
        setMessages: v.setMessages,
        getMessages: v.getMessages
      };
    }),
    messages = _useChatAnywhere.messages,
    setMessages = _useChatAnywhere.setMessages,
    getMessages = _useChatAnywhere.getMessages;
  var updateMessage = React.useCallback(function () {
    var _ref;
    var id = ((_ref = arguments.length <= 0 ? undefined : arguments[0]) === null || _ref === void 0 ? void 0 : _ref.id) || (arguments.length <= 0 ? undefined : arguments[0]);
    var message = (arguments.length <= 1 ? undefined : arguments[1]) || (arguments.length <= 0 ? undefined : arguments[0]);
    setMessages === null || setMessages === void 0 || setMessages(function (prev) {
      var index = prev.findIndex(function (item) {
        return item.id === id;
      });
      if (index > -1) {
        var nextMessage = _objectSpread(_objectSpread({}, prev[index]), message);
        return [].concat(_toConsumableArray(prev.slice(0, index)), [nextMessage], _toConsumableArray(prev.slice(index + 1)));
      } else {
        return [].concat(_toConsumableArray(prev), [message]);
      }
    });

    // @ts-ignore
  }, []);
  var removeMessage = React.useCallback(function (message) {
    setMessages(function (prev) {
      return prev.filter(function (item) {
        return item.id !== message.id;
      });
    });
  }, []);
  var removeAllMessages = React.useCallback(function () {
    setMessages([]);
  }, []);
  var getMessage = React.useCallback(function (id) {
    return getMessages().find(function (item) {
      return item.id === id;
    });
  }, []);
  return {
    messages: messages,
    getMessage: getMessage,
    setMessages: setMessages,
    getMessages: getMessages,
    updateMessage: updateMessage,
    removeMessage: removeMessage,
    removeAllMessages: removeAllMessages
  };
}