function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
import React from 'react';
import { useChatAnywhere } from "./ChatAnywhereProvider";
import { v4 as uuid } from 'uuid';
import ReactDOM from 'react-dom';
export function useSessionList() {
  var _useChatAnywhere = useChatAnywhere(function (v) {
      return {
        getCurrentSessionKey: v.getCurrentSessionKey,
        currentRegenerateIndex: v.currentRegenerateIndex,
        setCurrentRegenerateIndex: v.setCurrentRegenerateIndex,
        getCurrentRegenerateIndex: v.getCurrentRegenerateIndex,
        sessionListShow: v.sessionListShow,
        setSessionListShow: v.setSessionListShow,
        sessionList: v.sessionList,
        setSessionList: v.setSessionList,
        currentSessionKey: v.currentSessionKey,
        setCurrentSessionKey: v.setCurrentSessionKey,
        getSessionList: v.getSessionList
      };
    }),
    getCurrentSessionKey = _useChatAnywhere.getCurrentSessionKey,
    sessionList = _useChatAnywhere.sessionList,
    setSessionList = _useChatAnywhere.setSessionList,
    currentSessionKey = _useChatAnywhere.currentSessionKey,
    setCurrentSessionKey = _useChatAnywhere.setCurrentSessionKey,
    sessionListShow = _useChatAnywhere.sessionListShow,
    setSessionListShow = _useChatAnywhere.setSessionListShow,
    currentRegenerateIndex = _useChatAnywhere.currentRegenerateIndex,
    setCurrentRegenerateIndex = _useChatAnywhere.setCurrentRegenerateIndex,
    getCurrentRegenerateIndex = _useChatAnywhere.getCurrentRegenerateIndex,
    getSessionList = _useChatAnywhere.getSessionList;
  var createSession = React.useCallback(function () {
    var newKey = uuid();
    var newSession = {
      label: Date.now().toString(),
      key: newKey,
      messages: [[]]
    };
    ReactDOM.flushSync(function () {
      setSessionList(function (sessionList) {
        var newSessionList = [].concat(_toConsumableArray(sessionList), [newSession]);
        return newSessionList;
      });
      setCurrentSessionKey(newKey);
    });
    return newKey;
  }, []);
  var deleteSession = React.useCallback(function (key) {
    setSessionList(function (sessionList) {
      var newSessionList = sessionList.filter(function (item) {
        return item.key !== key;
      });
      return newSessionList;
    });
  }, []);
  var updateSessionMessages = React.useCallback(function (messages) {
    var currentSessionKey = getCurrentSessionKey();
    var currentRegenerateIndex = getCurrentRegenerateIndex();
    setSessionList(function (sessionList) {
      return sessionList.map(function (session) {
        if (session.key === currentSessionKey) {
          session.messages[currentRegenerateIndex] = messages;
          return _objectSpread({}, session);
        }
        return session;
      });
    });
  }, []);
  var getMessagesBySession = React.useCallback(function (currentSessionKey, currentRegenerateIndex) {
    var _getSessionList$find;
    return (_getSessionList$find = getSessionList().find(function (session) {
      return session.key === currentSessionKey;
    })) === null || _getSessionList$find === void 0 ? void 0 : _getSessionList$find.messages[currentRegenerateIndex];
  }, []);
  var getSession = React.useCallback(function () {
    return {
      sessionList: getSessionList(),
      currentSessionKey: getCurrentSessionKey(),
      currentRegenerateIndex: getCurrentRegenerateIndex()
    };
  }, []);
  var updateSession = React.useCallback(function (data) {
    var sessionList = data.sessionList,
      currentSessionKey = data.currentSessionKey,
      currentRegenerateIndex = data.currentRegenerateIndex;
    setSessionList(sessionList);
    setCurrentSessionKey(currentSessionKey);
    setCurrentRegenerateIndex(currentRegenerateIndex);
  }, []);
  return {
    currentRegenerateIndex: currentRegenerateIndex,
    setCurrentRegenerateIndex: setCurrentRegenerateIndex,
    getCurrentRegenerateIndex: getCurrentRegenerateIndex,
    sessionList: sessionList,
    setSessionList: setSessionList,
    getSessionList: getSessionList,
    currentSessionKey: currentSessionKey,
    setCurrentSessionKey: setCurrentSessionKey,
    sessionListShow: sessionListShow,
    setSessionListShow: setSessionListShow,
    createSession: createSession,
    deleteSession: deleteSession,
    updateSessionMessages: updateSessionMessages,
    getMessagesBySession: getMessagesBySession,
    getSession: getSession,
    updateSession: updateSession
  };
}