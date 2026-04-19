function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _excluded = ["width", "height", "poster", "src"];
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
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import { useProviderContext } from "..";
import { useRef, useState, useCallback } from "react";
import { SparkEnlargeLine, SparkPauseFill, SparkPlayFill } from "@agentscope-ai/icons";
import cls from "classnames";
import { IconButton } from "@agentscope-ai/design";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export default function Video(props) {
  var prefixCls = useProviderContext().getPrefixCls('assets-preview-video');
  var _props$width = props.width,
    width = _props$width === void 0 ? 1 : _props$width,
    _props$height = props.height,
    height = _props$height === void 0 ? 1 : _props$height,
    poster = props.poster,
    src = props.src,
    rest = _objectWithoutProperties(props, _excluded);
  var videoRef = useRef(null);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isPlaying = _useState2[0],
    setIsPlaying = _useState2[1];
  var _useState3 = useState(0),
    _useState4 = _slicedToArray(_useState3, 2),
    duration = _useState4[0],
    setDuration = _useState4[1];
  var _useState5 = useState(0),
    _useState6 = _slicedToArray(_useState5, 2),
    currentTime = _useState6[0],
    setCurrentTime = _useState6[1];
  var formatTime = useCallback(function (seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return "".concat(mins.toString().padStart(2, '0'), ":").concat(secs.toString().padStart(2, '0'));
  }, []);
  var handlePlayPause = useCallback(function () {
    var video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);
  var handleLoadedMetadata = useCallback(function () {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);
  var handleEnded = useCallback(function () {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);
  var handleTimeUpdate = useCallback(function () {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);
  var handleEnlarge = useCallback(function (event) {
    event.stopPropagation();
    var video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      // Safari 兼容
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      // IE11 兼容
      video.msRequestFullscreen();
    }
  }, []);
  return /*#__PURE__*/_jsxs("div", {
    className: prefixCls,
    style: {
      aspectRatio: "".concat(width, "/").concat(height)
    },
    children: [/*#__PURE__*/_jsx("video", _objectSpread(_objectSpread({}, rest), {}, {
      ref: videoRef,
      src: src,
      poster: poster,
      preload: "metadata",
      onLoadedMetadata: handleLoadedMetadata,
      onTimeUpdate: handleTimeUpdate,
      onEnded: handleEnded
    })), /*#__PURE__*/_jsxs("div", {
      className: cls("".concat(prefixCls, "-overlay"), _defineProperty({}, "".concat(prefixCls, "-overlay-playing"), 1)),
      onClick: isPlaying ? handlePlayPause : handlePlayPause,
      children: [/*#__PURE__*/_jsx("div", {
        className: "".concat(prefixCls, "-play-btn"),
        children: isPlaying ? /*#__PURE__*/_jsx(SparkPauseFill, {}) : /*#__PURE__*/_jsx(SparkPlayFill, {})
      }), /*#__PURE__*/_jsx("div", {
        className: "".concat(prefixCls, "-enlarge"),
        onClick: handleEnlarge,
        children: /*#__PURE__*/_jsx(IconButton, {
          bordered: false,
          size: "small",
          icon: /*#__PURE__*/_jsx(SparkEnlargeLine, {})
        })
      })]
    }), /*#__PURE__*/_jsx("div", {
      className: "".concat(prefixCls, "-duration"),
      children: formatTime(duration - currentTime)
    })]
  });
}