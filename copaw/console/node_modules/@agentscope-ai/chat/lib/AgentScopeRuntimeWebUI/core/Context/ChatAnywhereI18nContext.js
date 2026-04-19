function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import { createContext, useContextSelector } from 'use-context-selector';
import { useMemo, useState, useCallback } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
// 国际化文案定义
var messages = {
  cn: {
    // Approval 相关
    'approval.title': '人工干预',
    'approval.pending': '请确认是否执行该操作',
    'approval.confirmed': '确认执行任务',
    'approval.canceled': '取消执行任务',
    'approval.cancel': '取消执行',
    'approval.confirm': '确认执行',
    'approval.taskRunning': '当前有正在执行的任务，无法发送新的任务',
    // ApprovalCancelPopover 相关
    'cancelPopover.title': '取消原因',
    'cancelPopover.placeholder': '请输入原因，以便大模型做进一步规划',
    'cancelPopover.cancel': '取消',
    'cancelPopover.confirm': '确认',
    'cancelPopover.options.notNeeded': '不需要',
    'cancelPopover.options.poorResult': '效果不理想',
    'cancelPopover.options.tooSlow': '等待时间久',
    'cancelPopover.options.wrongInput': '输入错误',
    // 通用
    'common.save': '保存',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.loading': '加载中...',
    'common.saveSuccess': '保存成功',
    'common.saveFailed': '保存失败',
    // Actions 相关
    'actions.regenerate': '重新生成',
    // MessageImport 相关
    'messageImport.title': 'Sessions 数据导入',
    'messageImport.placeholder': '输入 JSON 数据以覆盖当前 sessions',
    'messageImport.saveToLocalStorage': '保存到 LocalStorage'
  },
  en: {
    // Approval related
    'approval.title': 'Human Intervention',
    'approval.pending': 'Please confirm whether to execute this operation',
    'approval.confirmed': 'Confirmed to execute task',
    'approval.canceled': 'Canceled task execution',
    'approval.cancel': 'Cancel',
    'approval.confirm': 'Confirm',
    'approval.taskRunning': 'A task is currently running, cannot send new task',
    // ApprovalCancelPopover related
    'cancelPopover.title': 'Cancel Reason',
    'cancelPopover.placeholder': 'Please enter the reason for better AI planning',
    'cancelPopover.cancel': 'Cancel',
    'cancelPopover.confirm': 'Confirm',
    'cancelPopover.options.notNeeded': 'Not needed',
    'cancelPopover.options.poorResult': 'Poor result',
    'cancelPopover.options.tooSlow': 'Too slow',
    'cancelPopover.options.wrongInput': 'Wrong input',
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.saveSuccess': 'Saved successfully',
    'common.saveFailed': 'Failed to save',
    // Actions related
    'actions.regenerate': 'Regenerate',
    // MessageImport related
    'messageImport.title': 'Import Sessions Data',
    'messageImport.placeholder': 'Enter JSON data to override current sessions',
    'messageImport.saveToLocalStorage': 'Save to LocalStorage'
  }
};
var ChatAnywhereI18nContext = createContext(undefined);
export function useChatAnywhereI18n(selector) {
  try {
    var context = useContextSelector(ChatAnywhereI18nContext, selector);
    return context;
  } catch (error) {
    return {};
  }
}

// 便捷 hook：直接获取翻译函数
export function useTranslation() {
  var t = useChatAnywhereI18n(function (ctx) {
    return ctx === null || ctx === void 0 ? void 0 : ctx.t;
  });
  var locale = useChatAnywhereI18n(function (ctx) {
    return ctx === null || ctx === void 0 ? void 0 : ctx.locale;
  });
  var setLocale = useChatAnywhereI18n(function (ctx) {
    return ctx === null || ctx === void 0 ? void 0 : ctx.setLocale;
  });
  return {
    t: t,
    locale: locale,
    setLocale: setLocale
  };
}
export function ChatAnywhereI18nContextProvider(props) {
  var children = props.children,
    _props$defaultLocale = props.defaultLocale,
    defaultLocale = _props$defaultLocale === void 0 ? 'en' : _props$defaultLocale;
  var _useState = useState(defaultLocale),
    _useState2 = _slicedToArray(_useState, 2),
    locale = _useState2[0],
    setLocale = _useState2[1];
  var t = useCallback(function (key, params) {
    var message = messages[locale][key] || key;

    // 支持参数替换，如 t('hello', { name: 'World' }) => "Hello, World"
    if (params) {
      Object.entries(params).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          paramKey = _ref2[0],
          value = _ref2[1];
        message = message.replace(new RegExp("\\{".concat(paramKey, "\\}"), 'g'), String(value));
      });
    }
    return message;
  }, [locale]);
  var value = useMemo(function () {
    return {
      locale: locale,
      setLocale: setLocale,
      t: t,
      messages: messages[locale]
    };
  }, [locale, setLocale, t]);
  return /*#__PURE__*/_jsx(ChatAnywhereI18nContext.Provider, {
    value: value,
    children: children
  });
}
export default ChatAnywhereI18nContext;