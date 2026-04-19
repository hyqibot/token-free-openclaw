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
import { useProviderContext } from "../Provider";
import Style from "./style";
import cls from 'classnames';
import Image, { ImagesContainer } from "./Image";
import Video from "./Video";
import Audio from "./Audio";
import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import { SparkLeftLine, SparkRightLine } from '@agentscope-ai/icons';
import { IconButton } from '@agentscope-ai/design';
import { useUpdate, useSize } from 'ahooks';
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
function AssetsPreview(props) {
  var _props$classNames;
  var update = useUpdate();
  var prefixCls = useProviderContext().getPrefixCls('assets-preview');
  var ref = useRef(null);
  var _props$height = props.height,
    height = _props$height === void 0 ? 144 : _props$height;
  var arrowTop = height / 2 - 12;
  var maxWidth = useRef(0);
  var _useState = useState(0),
    _useState2 = _slicedToArray(_useState, 2),
    scrollLeft = _useState2[0],
    setScrollLeft = _useState2[1];
  var deferScrollLeft = useDeferredValue(scrollLeft);
  var size = useSize(ref);
  var onScroll = useCallback(function (e) {
    setScrollLeft(e.target.scrollLeft);
  }, []);
  useEffect(function () {
    if (ref.current && props.type !== 'audio') {
      maxWidth.current = ref.current.scrollWidth - ref.current.clientWidth;
    }
    update();
  }, [props.data.length, size === null || size === void 0 ? void 0 : size.width]);
  var toArrow = useCallback(function (direct) {
    var width = 200;
    ref.current.scrollLeft = ref.current.scrollLeft + width * (direct === 'left' ? -1 : 1);
  }, []);
  var Component = {
    image: Image,
    video: Video,
    audio: Audio
  }[props.type];
  var list = props.data.map(function (item, index) {
    return /*#__PURE__*/_jsx(Component, _objectSpread({}, item), index);
  });
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsxs("div", {
      className: cls("".concat(prefixCls), props.className),
      children: [/*#__PURE__*/_jsx("div", {
        className: cls("".concat(prefixCls, "-container"), (_props$classNames = props.classNames) === null || _props$classNames === void 0 ? void 0 : _props$classNames.container),
        style: props.type !== 'audio' ? {
          height: height
        } : {
          flexDirection: 'column'
        },
        onScroll: onScroll,
        ref: ref,
        children: props.type === 'image' ? /*#__PURE__*/_jsx(ImagesContainer, {
          children: list
        }) : list
      }), arrowTop > 0 && props.type !== 'audio' ? /*#__PURE__*/_jsxs(_Fragment, {
        children: [deferScrollLeft > 50 && /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx("div", {
            className: cls("".concat(prefixCls, "-left-edge"))
          }), /*#__PURE__*/_jsx(IconButton, {
            onClick: function onClick() {
              return toArrow('left');
            },
            style: {
              top: arrowTop
            },
            className: cls("".concat(prefixCls, "-left-arrow"), "".concat(prefixCls, "-arrow")),
            size: "small",
            shape: "circle",
            icon: /*#__PURE__*/_jsx(SparkLeftLine, {})
          })]
        }), deferScrollLeft < maxWidth.current - 50 && /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx("div", {
            className: cls("".concat(prefixCls, "-right-edge"))
          }), /*#__PURE__*/_jsx(IconButton, {
            onClick: function onClick() {
              return toArrow('right');
            },
            style: {
              top: arrowTop
            },
            className: cls("".concat(prefixCls, "-right-arrow"), "".concat(prefixCls, "-arrow")),
            size: "small",
            shape: "circle",
            icon: /*#__PURE__*/_jsx(SparkRightLine, {})
          })]
        })]
      }) : null]
    })]
  });
}
export default AssetsPreview;