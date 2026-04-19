function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import classnames from 'classnames';
import React from 'react';
import { createPortal } from 'react-dom';
import { AttachmentContext } from "./context";
import { jsx as _jsx } from "react/jsx-runtime";
export default function DropArea(props) {
  var getDropContainer = props.getDropContainer,
    className = props.className,
    prefixCls = props.prefixCls,
    children = props.children;
  var _React$useContext = React.useContext(AttachmentContext),
    disabled = _React$useContext.disabled;
  var _React$useState = React.useState(),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    container = _React$useState2[0],
    setContainer = _React$useState2[1];
  var _React$useState3 = React.useState(null),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    showArea = _React$useState4[0],
    setShowArea = _React$useState4[1];
  React.useEffect(function () {
    var nextContainer = getDropContainer === null || getDropContainer === void 0 ? void 0 : getDropContainer();
    if (container !== nextContainer) {
      setContainer(nextContainer);
    }
  }, [getDropContainer]);
  React.useEffect(function () {
    // Add global drop event
    if (container) {
      var onDragEnter = function onDragEnter() {
        setShowArea(true);
      };

      // Should prevent default to make drop event work
      var onDragOver = function onDragOver(e) {
        e.preventDefault();
      };
      var onDragLeave = function onDragLeave(e) {
        if (!e.relatedTarget) {
          setShowArea(false);
        }
      };
      var onDrop = function onDrop(e) {
        setShowArea(false);
        e.preventDefault();
      };
      document.addEventListener('dragenter', onDragEnter);
      document.addEventListener('dragover', onDragOver);
      document.addEventListener('dragleave', onDragLeave);
      document.addEventListener('drop', onDrop);
      return function () {
        document.removeEventListener('dragenter', onDragEnter);
        document.removeEventListener('dragover', onDragOver);
        document.removeEventListener('dragleave', onDragLeave);
        document.removeEventListener('drop', onDrop);
      };
    }
  }, [!!container]);
  var showDropdown = getDropContainer && container && !disabled;
  if (!showDropdown) {
    return null;
  }
  var areaCls = "".concat(prefixCls, "-drop-area");
  return /*#__PURE__*/createPortal( /*#__PURE__*/_jsx("div", {
    className: classnames(areaCls, className, _defineProperty({}, "".concat(areaCls, "-on-body"), container.tagName === 'BODY')),
    style: {
      display: showArea ? 'block' : 'none'
    },
    children: children
  }), container);
}