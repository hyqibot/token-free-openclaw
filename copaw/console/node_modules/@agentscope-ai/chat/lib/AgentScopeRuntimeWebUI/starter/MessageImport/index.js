function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { SparkFileCodeLine } from "@agentscope-ai/icons";
import { IconButton, Drawer, Input, Button, message } from "@agentscope-ai/design";
import { useState, useEffect } from "react";
import { useTranslation } from "../../core/Context/ChatAnywhereI18nContext";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
var STORAGE_KEY = "agent-scope-runtime-webui-sessions";
export default function (props) {
  var _useTranslation = useTranslation(),
    t = _useTranslation.t;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    open = _useState2[0],
    setOpen = _useState2[1];
  var _useState3 = useState(""),
    _useState4 = _slicedToArray(_useState3, 2),
    sessionValue = _useState4[0],
    setSessionValue = _useState4[1];
  useEffect(function () {
    if (open) {
      var storedValue = localStorage.getItem(STORAGE_KEY) || "";
      setSessionValue(storedValue);
    }
  }, [open]);
  var handleSave = function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, sessionValue);
      message.success((t === null || t === void 0 ? void 0 : t('common.saveSuccess')) || '保存成功');
      location.reload();
    } catch (e) {
      message.error((t === null || t === void 0 ? void 0 : t('common.saveFailed')) || '保存失败');
    }
  };
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(IconButton, {
      onClick: function onClick() {
        return setOpen(true);
      },
      icon: /*#__PURE__*/_jsx(SparkFileCodeLine, {}),
      bordered: false
    }), /*#__PURE__*/_jsx(Drawer, {
      destroyOnHidden: true,
      open: open,
      onClose: function onClose() {
        return setOpen(false);
      },
      title: (t === null || t === void 0 ? void 0 : t('messageImport.title')) || 'Sessions 数据导入',
      styles: {
        body: {
          padding: 16
        },
        header: {
          padding: 8
        }
      },
      children: /*#__PURE__*/_jsxs("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 12
        },
        children: [/*#__PURE__*/_jsx(Input.TextArea, {
          value: sessionValue,
          onChange: function onChange(e) {
            return setSessionValue(e.target.value);
          },
          placeholder: (t === null || t === void 0 ? void 0 : t('messageImport.placeholder')) || '输入 JSON 数据以覆盖当前 sessions',
          rows: 10,
          style: {
            fontFamily: "monospace"
          }
        }), /*#__PURE__*/_jsx(Button, {
          type: "primary",
          onClick: handleSave,
          children: (t === null || t === void 0 ? void 0 : t('messageImport.saveToLocalStorage')) || '保存到 LocalStorage'
        })]
      })
    })]
  });
}