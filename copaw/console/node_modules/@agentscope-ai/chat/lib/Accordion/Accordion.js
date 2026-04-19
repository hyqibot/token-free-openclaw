function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
import React, { useMemo, useRef } from 'react';
import cls from 'classnames';
import BodyContent from "./BodyContent";
import SoftLightTitle from "./SoftLightTitle";
import Style from "./style";
import { useProviderContext } from "../Provider";
import { SparkCheckCircleFill, SparkErrorCircleFill, SparkDownLine, SparkUpLine, SparkLoadingLine, SparkStopCircleLine } from '@agentscope-ai/icons';
import { Transition } from 'react-transition-group';
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
function Item(props) {
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('accordion-group');
  var _React$useState = React.useState(props.defaultOpen),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    stateOpen = _React$useState2[0],
    setStateOpen = _React$useState2[1];

  // 支持受控模式：如果提供了 open prop，则使用它；否则使用内部状态
  var isOpen = props.open !== undefined ? props.open : stateOpen;
  var status = props.inline ? 'close' : isOpen ? 'open' : 'close';
  var icon = useMemo(function () {
    if (props.icon) return props.icon;
    if (props.status === 'generating') return /*#__PURE__*/_jsx(SparkLoadingLine, {
      className: "".concat(prefixCls, "-icon-loading"),
      spin: true
    });
    if (props.status === 'finished') return /*#__PURE__*/_jsx(SparkCheckCircleFill, {
      className: "".concat(prefixCls, "-icon-success")
    });
    if (props.status === 'interrupted') return /*#__PURE__*/_jsx(SparkStopCircleLine, {});
    if (props.status === 'error') return /*#__PURE__*/_jsx(SparkErrorCircleFill, {
      className: "".concat(prefixCls, "-icon-error")
    });
  }, [props.status, props.icon]);
  var content = useMemo(function () {
    if (props.steps) {
      return props.steps.map(function (item, index) {
        var isFirst = index === 0;
        var isLast = index === props.steps.length - 1;

        // @ts-ignore
        return /*#__PURE__*/_jsx(Item, _objectSpread(_objectSpread({}, item), {}, {
          isFirst: isFirst,
          isLast: isLast
        }), item.id || index);
      });
    } else {
      return props.children;
    }
  }, [props.steps, props.children]);
  return /*#__PURE__*/_jsxs("div", {
    className: cls("".concat(prefixCls), "".concat(prefixCls, "-").concat(status)),
    children: [/*#__PURE__*/_jsxs("div", {
      className: cls("".concat(prefixCls, "-header"), "".concat(prefixCls, "-header-").concat(status)),
      onClick: function onClick() {
        return content && props.open === undefined && setStateOpen(!stateOpen);
      },
      children: [icon ? /*#__PURE__*/_jsx("div", {
        className: cls("".concat(prefixCls, "-header-icon"), _defineProperty(_defineProperty(_defineProperty({}, "".concat(prefixCls, "-header-icon-line"), props.iconLine), "".concat(prefixCls, "-header-icon-first"), props.isFirst), "".concat(prefixCls, "-header-icon-last"), props.isLast && status === 'close' || props.level)),
        children: icon
      }) : null, /*#__PURE__*/_jsx("div", {
        children: props.title
      }), content && /*#__PURE__*/_jsx("div", {
        className: cls("".concat(prefixCls, "-header-arrow")),
        children: !isOpen ? /*#__PURE__*/_jsx(SparkDownLine, {}) : /*#__PURE__*/_jsx(SparkUpLine, {})
      }), /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx("span", {
          style: {
            flex: 1
          }
        }), props.rightChildren]
      })]
    }), /*#__PURE__*/_jsx(Children, {
      prefixCls: prefixCls,
      stateOpen: isOpen,
      status: status,
      inline: props.inline,
      content: content,
      bodyStyle: props.bodyStyle
      // @ts-ignore
      ,
      level: props.level
    })]
  });
}
var transitionStyles = {
  entering: {
    opacity: 1
  },
  entered: {
    opacity: 1
  },
  exiting: {
    opacity: 0
  },
  exited: {
    opacity: 0
  }
};
function Children(props) {
  var nodeRef = useRef(null);
  if (!props.content) return null;
  var prefixCls = props.prefixCls;
  var stateOpen = props.stateOpen;
  var inline = props.inline;
  var bodyStyle = props.bodyStyle;
  var level = props.level;
  return /*#__PURE__*/_jsx(Transition, {
    nodeRef: nodeRef,
    in: stateOpen,
    timeout: 300,
    children: function children(state) {
      return /*#__PURE__*/_jsx("div", {
        style: _objectSpread(_objectSpread(_objectSpread({}, bodyStyle), level ? {
          marginTop: 0
        } : {}), {}, {
          transition: "opacity ".concat(300, "ms ease-in-out")
        }, transitionStyles[state]),
        className: cls("".concat(prefixCls, "-body"), "".concat(prefixCls, "-body-").concat(stateOpen ? 'open' : 'close'), _defineProperty({}, "".concat(prefixCls, "-body-inline"), inline)),
        children: props.content
      });
    }
  });
}
function Accordion(props) {
  // @ts-ignore
  var _props$level = props.level,
    level = _props$level === void 0 ? 1 : _props$level,
    _props$isFirst = props.isFirst,
    isFirst = _props$isFirst === void 0 ? true : _props$isFirst,
    _props$isLast = props.isLast,
    isLast = _props$isLast === void 0 ? true : _props$isLast;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsx(Item, _objectSpread(_objectSpread({}, props), {}, {
      level: level,
      isFirst: isFirst,
      isLast: isLast
    }))]
  });
}
Accordion.BodyContent = BodyContent;
Accordion.SoftLightTitle = SoftLightTitle;
export default Accordion;