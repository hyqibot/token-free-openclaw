function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _excluded = ["title", "description", "maxCount"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import React, { useMemo, useContext } from 'react';
import cls from 'classnames';
import { Attachments, Sender, useProviderContext } from "../../..";
import { SendHeaderContext } from "../../../Sender/SenderHeader";
import MediaUpload from "../Upload";
import MediaInfo from "../Info";
import Style from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var SenderHeader = function SenderHeader(props) {
  var className = props.className,
    _props$onUpload = props.onUpload,
    onUpload = _props$onUpload === void 0 ? [] : _props$onUpload,
    _props$attachedFiles = props.attachedFiles,
    attachedFiles = _props$attachedFiles === void 0 ? [[]] : _props$attachedFiles,
    onFileChange = props.onFileChange;
  var _useProviderContext = useProviderContext(),
    getPrefixCls = _useProviderContext.getPrefixCls;
  var _useContext = useContext(SendHeaderContext),
    focus = _useContext.focus,
    enableFocusExpand = _useContext.enableFocusExpand;
  var prefixCls = getPrefixCls('aigc-sender-header');
  var open = useMemo(function () {
    if (attachedFiles.flat().length > 0) {
      return true;
    }
    if (onUpload.length <= 0) {
      return false;
    }
    if (focus) {
      return true;
    }
    if (!enableFocusExpand) {
      return true;
    }
    return false;
  }, [onUpload, attachedFiles, enableFocusExpand, focus]);
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsx(Sender.Header, {
      closable: false,
      open: open,
      children: /*#__PURE__*/_jsx("div", {
        className: cls(prefixCls, className),
        tabIndex: 0,
        children: onUpload === null || onUpload === void 0 ? void 0 : onUpload.map(function (item, index) {
          var title = item.title,
            description = item.description,
            _item$maxCount = item.maxCount,
            maxCount = _item$maxCount === void 0 ? 1 : _item$maxCount,
            restProps = _objectWithoutProperties(item, _excluded);
          var fileList = attachedFiles[index] || [];
          return /*#__PURE__*/_jsxs(_Fragment, {
            children: [/*#__PURE__*/_jsx(MediaUpload, _objectSpread({
              className: cls(_defineProperty({}, "".concat(prefixCls, "-upload-hidden"), fileList.length >= maxCount)),
              maxCount: maxCount,
              fileList: fileList,
              onChange: function onChange(info) {
                if (item.beforeUpload && info.file.status) {
                  onFileChange(index, info.fileList);
                }
                if (!item.beforeUpload) {
                  onFileChange(index, info.fileList);
                }
              },
              showUploadList: false
            }, restProps), "upload-".concat(index)), fileList.length > 0 && /*#__PURE__*/_jsx(Attachments, {
              items: fileList,
              onChange: function onChange(info) {
                return onFileChange(index, info.fileList);
              }
            }, "attachments-".concat(index)), maxCount === 1 && /*#__PURE__*/_jsx(MediaInfo, {
              title: title,
              description: description
            }, "info-".concat(index))]
          });
        })
      })
    })]
  });
};
export default SenderHeader;