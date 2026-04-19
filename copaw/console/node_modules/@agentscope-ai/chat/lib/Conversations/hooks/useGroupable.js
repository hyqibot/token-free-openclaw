function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import React from 'react';
/**
 * 🔥 Only for handling ungrouped data. Do not use it for any other purpose! 🔥
 */
var __UNGROUPED = '__ungrouped';
var useGroupable = function useGroupable(groupable) {
  var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var _React$useMemo = React.useMemo(function () {
      if (!groupable) {
        return [false, undefined, undefined];
      }
      var baseConfig = {
        sort: undefined,
        title: undefined
      };
      if (_typeof(groupable) === 'object') {
        baseConfig = _objectSpread(_objectSpread({}, baseConfig), groupable);
      }
      return [true, baseConfig.sort, baseConfig.title];
    }, [groupable]),
    _React$useMemo2 = _slicedToArray(_React$useMemo, 3),
    enableGroup = _React$useMemo2[0],
    sort = _React$useMemo2[1],
    title = _React$useMemo2[2];
  return React.useMemo(function () {
    // 未开启分组模式直接返回
    if (!enableGroup) {
      var _groupList = [{
        name: __UNGROUPED,
        data: items,
        title: undefined
      }];
      return [_groupList, enableGroup];
    }

    // 1. 将 data 做数据分组，填充 groupMap
    var groupMap = items.reduce(function (acc, item) {
      var group = item.group || __UNGROUPED;
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(item);
      return acc;
    }, {});

    // 2. 存在 sort 时对 groupKeys 排序
    var groupKeys = sort ? Object.keys(groupMap).sort(sort) : Object.keys(groupMap);

    // 3. groupMap 转 groupList
    var groupList = groupKeys.map(function (group) {
      return {
        name: group === __UNGROUPED ? undefined : group,
        title: title,
        data: groupMap[group]
      };
    });
    return [groupList, enableGroup];
  }, [items, groupable]);
};
export default useGroupable;