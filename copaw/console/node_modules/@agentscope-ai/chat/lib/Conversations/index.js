function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _excluded = ["prefixCls", "rootClassName", "items", "activeKey", "defaultActiveKey", "onActiveChange", "selectable", "selectedKeys", "onSelectChange", "menu", "styles", "classNames", "groupable", "className", "style"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
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
import classnames from 'classnames';
import React from 'react';
import GroupTitle, { GroupTitleContext } from "./GroupTitle";
import ConversationsItem from "./Item";
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { useProviderContext } from "./..";
import useGroupable from "./hooks/useGroupable";
import Style from "./style";
import pickAttrs from 'rc-util/lib/pickAttrs';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
var Conversations = function Conversations(props) {
  var customizePrefixCls = props.prefixCls,
    rootClassName = props.rootClassName,
    items = props.items,
    activeKey = props.activeKey,
    defaultActiveKey = props.defaultActiveKey,
    onActiveChange = props.onActiveChange,
    propsSelectable = props.selectable,
    selectedKeys = props.selectedKeys,
    onSelectChange = props.onSelectChange,
    menu = props.menu,
    _props$styles = props.styles,
    styles = _props$styles === void 0 ? {} : _props$styles,
    _props$classNames = props.classNames,
    classNames = _props$classNames === void 0 ? {} : _props$classNames,
    groupable = props.groupable,
    className = props.className,
    style = props.style,
    restProps = _objectWithoutProperties(props, _excluded);
  var domProps = pickAttrs(restProps, {
    attr: true,
    aria: true,
    data: true
  });
  var _useMergedState = useMergedState(defaultActiveKey, {
      value: activeKey
    }),
    _useMergedState2 = _slicedToArray(_useMergedState, 2),
    mergedActiveKey = _useMergedState2[0],
    setMergedActiveKey = _useMergedState2[1];
  var _useGroupable = useGroupable(groupable, items),
    _useGroupable2 = _slicedToArray(_useGroupable, 2),
    groupList = _useGroupable2[0],
    enableGroup = _useGroupable2[1];
  var _useProviderContext = useProviderContext(),
    direction = _useProviderContext.direction,
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('conversations');
  var mergedCls = classnames(prefixCls, className, rootClassName, _defineProperty({}, "".concat(prefixCls, "-rtl"), direction === 'rtl'));
  var onActiveChangeRef = React.useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;
  var onConversationItemClick = React.useCallback(function (info) {
    var _onActiveChangeRef$cu;
    setMergedActiveKey(info.key);
    (_onActiveChangeRef$cu = onActiveChangeRef.current) === null || _onActiveChangeRef$cu === void 0 || _onActiveChangeRef$cu.call(onActiveChangeRef, info.key);
  }, [setMergedActiveKey]);
  var selectedKeysRef = React.useRef(selectedKeys);
  selectedKeysRef.current = selectedKeys;
  var onSelectChangeRef = React.useRef(onSelectChange);
  onSelectChangeRef.current = onSelectChange;
  var handleItemSelect = React.useCallback(function (key, selected) {
    if (!onSelectChangeRef.current) return;
    var keys = selectedKeysRef.current || [];
    var next = selected ? [].concat(_toConsumableArray(keys), [key]) : keys.filter(function (k) {
      return k !== key;
    });
    onSelectChangeRef.current(next);
  }, []);
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx(Style, {}), /*#__PURE__*/_jsx("ul", _objectSpread(_objectSpread({}, domProps), {}, {
      style: style,
      className: mergedCls,
      children: groupList.map(function (groupInfo, groupIndex) {
        var convItems = groupInfo.data.map(function (convInfo, convIndex) {
          var itemSelectable = propsSelectable !== null && propsSelectable !== void 0 ? propsSelectable : convInfo.selectable;
          var itemSelected = itemSelectable ? selectedKeys ? selectedKeys.includes(convInfo.key) : convInfo.selected : false;
          var itemOnSelect = onSelectChange ? handleItemSelect : convInfo.onSelect;
          return /*#__PURE__*/_jsx(ConversationsItem, {
            info: convInfo,
            prefixCls: prefixCls,
            direction: direction,
            className: classnames(classNames.item),
            style: styles.item,
            menu: menu,
            active: mergedActiveKey === convInfo.key,
            selectable: itemSelectable,
            selected: itemSelected,
            onSelect: itemOnSelect,
            onClick: onConversationItemClick
          }, convInfo.key || "key-".concat(convIndex));
        });
        if (enableGroup) {
          var _groupInfo$title;
          return /*#__PURE__*/_jsxs("li", {
            children: [/*#__PURE__*/_jsx(GroupTitleContext.Provider, {
              value: {
                prefixCls: prefixCls
              },
              children: ((_groupInfo$title = groupInfo.title) === null || _groupInfo$title === void 0 ? void 0 : _groupInfo$title.call(groupInfo, groupInfo.name, {
                components: {
                  GroupTitle: GroupTitle
                }
              })) || /*#__PURE__*/_jsx(GroupTitle, {
                children: groupInfo.name
              }, groupInfo.name)
            }), /*#__PURE__*/_jsx("ul", {
              className: "".concat(prefixCls, "-list"),
              children: convItems
            })]
          }, groupInfo.name || "key-".concat(groupIndex));
        }
        return convItems;
      })
    }))]
  });
};
export default Conversations;