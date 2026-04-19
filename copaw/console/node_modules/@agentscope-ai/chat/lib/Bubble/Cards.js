function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _excluded = ["component"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import React, { useMemo } from 'react';
import { useChatAnywhere, useCustomCardsContext } from "./..";
import { jsx as _jsx } from "react/jsx-runtime";
var Card = /*#__PURE__*/React.memo(function (props) {
  var cardConfig = useCustomCardsContext();
  var onInput = useChatAnywhere(function (v) {
    return v.onInput;
  });
  var Component = useMemo(function () {
    if (props.component) return props.component;
    var cardConfigMap = cardConfig;
    return (cardConfigMap === null || cardConfigMap === void 0 ? void 0 : cardConfigMap[props.code]) || function () {
      return "".concat(props.code, " not found");
    };
  }, []);
  if (typeof Component === 'function') {
    var component = props.component,
      rest = _objectWithoutProperties(props, _excluded);
    return /*#__PURE__*/_jsx(Component, _objectSpread(_objectSpread({}, rest), {}, {
      context: {
        onInput: onInput
      }
    }));
  } else {
    return Component;
  }
});
export default function Cards(props) {
  var cards = props.cards;
  if (!(cards !== null && cards !== void 0 && cards.length)) return null;
  return cards.map(function (card, index) {
    var cardComp = /*#__PURE__*/_jsx(Card, _objectSpread({
      index: index,
      id: props.id,
      isLast: props.isLast
    }, card), (card === null || card === void 0 ? void 0 : card.id) || index + card.code);
    if (card.code === 'Text') return /*#__PURE__*/_jsx("div", {
      className: props.className,
      children: cardComp
    }, index);
    return cardComp;
  });
}
export function createCard(code, data) {
  return {
    code: code,
    data: data
  };
}