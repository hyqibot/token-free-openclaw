function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { useProviderContext } from "..";
import { SparkMuteLine, SparkPauseFill, SparkPlayFill, SparkVolumeLine } from "@agentscope-ai/icons";
import { useCallback, useRef, useState, useEffect } from "react";
import { IconButton } from "@agentscope-ai/design";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
export default function Audio(props) {
  var prefixCls = useProviderContext().getPrefixCls("assets-preview-audio");
  var audioRef = useRef(null);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isPlaying = _useState2[0],
    setIsPlaying = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isMuted = _useState4[0],
    setIsMuted = _useState4[1];
  var _useState5 = useState(0),
    _useState6 = _slicedToArray(_useState5, 2),
    currentTime = _useState6[0],
    setCurrentTime = _useState6[1];
  var _useState7 = useState(0),
    _useState8 = _slicedToArray(_useState7, 2),
    duration = _useState8[0],
    setDuration = _useState8[1];
  var formatTime = useCallback(function (time) {
    if (isNaN(time)) return "00:00";
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time % 60);
    return "".concat(minutes.toString().padStart(2, "0"), ":").concat(seconds.toString().padStart(2, "0"));
  }, []);
  var togglePlay = useCallback(function () {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);
  var toggleMuted = useCallback(function () {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);
  var handleProgressClick = useCallback(function (e) {
    if (audioRef.current && duration) {
      var rect = e.currentTarget.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var percentage = x / rect.width;
      var newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);
  useEffect(function () {
    var audio = audioRef.current;
    if (!audio) return;
    var handleTimeUpdate = function handleTimeUpdate() {
      return setCurrentTime(audio.currentTime);
    };
    var handleLoadedMetadata = function handleLoadedMetadata() {
      return setDuration(audio.duration);
    };
    var handleEnded = function handleEnded() {
      return setIsPlaying(false);
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    return function () {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);
  var progress = duration ? currentTime / duration * 100 : 0;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("audio", {
      ref: audioRef,
      src: props.src,
      muted: isMuted
    }), /*#__PURE__*/_jsxs("div", {
      className: prefixCls,
      children: [/*#__PURE__*/_jsx(IconButton, {
        size: "small",
        type: "text",
        onClick: togglePlay,
        icon: isPlaying ? /*#__PURE__*/_jsx(SparkPauseFill, {}) : /*#__PURE__*/_jsx(SparkPlayFill, {})
      }), /*#__PURE__*/_jsx(IconButton, {
        size: "small",
        type: "text",
        onClick: toggleMuted,
        icon: isMuted ? /*#__PURE__*/_jsx(SparkMuteLine, {}) : /*#__PURE__*/_jsx(SparkVolumeLine, {})
      }), /*#__PURE__*/_jsx("div", {
        className: "".concat(prefixCls, "-time"),
        children: formatTime(currentTime)
      }), /*#__PURE__*/_jsx("div", {
        className: "".concat(prefixCls, "-progress"),
        onClick: handleProgressClick,
        children: /*#__PURE__*/_jsx("div", {
          className: "".concat(prefixCls, "-progress-bar"),
          style: {
            width: "".concat(progress, "%")
          }
        })
      }), /*#__PURE__*/_jsx("div", {
        className: "".concat(prefixCls, "-time"),
        children: formatTime(duration)
      })]
    })]
  });
}