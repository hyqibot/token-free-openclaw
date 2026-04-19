function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import React from 'react';
import { Form, Input, ColorPicker, Flex, Divider, InputNumber, Select } from 'antd';
import { createStyles } from 'antd-style';
import { Button, IconButton, Switch } from '@agentscope-ai/design';
import { SparkDeleteLine, SparkPlusLine } from '@agentscope-ai/icons';
import FormItem from "./FormItem";
import defaultConfig from "./defaultConfig";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var token = _ref.token,
    css = _ref.css;
  return {
    container: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    },
    form: {
      height: 0,
      flex: 1,
      padding: '8px 16px 16px 16px',
      overflow: 'auto'
    },
    actions: {
      padding: 16,
      display: 'flex',
      borderTop: "1px solid ".concat(token.colorBorderSecondary),
      justifyContent: 'flex-end',
      gap: 16
    }
  };
});
var OptionsEditor = function OptionsEditor(_ref2) {
  var value = _ref2.value,
    onChange = _ref2.onChange;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var _Form$useForm = Form.useForm(),
    _Form$useForm2 = _slicedToArray(_Form$useForm, 1),
    form = _Form$useForm2[0];
  var handleSave = function handleSave() {
    form.validateFields().then(function (values) {
      onChange(values);
    });
  };
  var handleReset = function handleReset() {
    form.setFieldsValue(defaultConfig);
  };
  return /*#__PURE__*/_jsxs("div", {
    className: styles.container,
    children: [/*#__PURE__*/_jsxs(Form, {
      className: styles.form,
      form: form,
      layout: "vertical",
      initialValues: value,
      children: [/*#__PURE__*/_jsx(Divider, {
        orientation: "left",
        children: "General"
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['theme', 'locale'],
        label: "Language",
        children: /*#__PURE__*/_jsx(Select, {
          options: [{
            label: '中文',
            value: 'cn'
          }, {
            label: 'English',
            value: 'en'
          }]
        })
      }), /*#__PURE__*/_jsx(Divider, {
        orientation: "left",
        children: "Theme"
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['theme', 'colorPrimary'],
        label: "colorPrimary",
        normalize: function normalize(value) {
          return value.toHexString();
        },
        children: /*#__PURE__*/_jsx(ColorPicker, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['theme', 'colorBgBase'],
        label: "colorBgBase",
        normalize: function normalize(value) {
          return value.toHexString();
        },
        children: /*#__PURE__*/_jsx(ColorPicker, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['theme', 'colorTextBase'],
        label: "colorTextBase",
        normalize: function normalize(value) {
          return value.toHexString();
        },
        children: /*#__PURE__*/_jsx(ColorPicker, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['theme', 'darkMode'],
        label: "darkMode",
        children: /*#__PURE__*/_jsx(Switch, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['theme', 'leftHeader', 'logo'],
        label: "leftHeader.logo",
        children: /*#__PURE__*/_jsx(Input, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['theme', 'leftHeader', 'title'],
        label: "leftHeader.title",
        children: /*#__PURE__*/_jsx(Input, {})
      }), /*#__PURE__*/_jsx(Divider, {
        orientation: "left",
        children: "Sender"
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['sender', 'disclaimer'],
        label: "disclaimer",
        children: /*#__PURE__*/_jsx(Input, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['sender', 'attachments'],
        label: "attachments",
        children: /*#__PURE__*/_jsx(Switch, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['sender', 'maxLength'],
        label: "maxLength",
        children: /*#__PURE__*/_jsx(InputNumber, {
          min: 1000
        })
      }), /*#__PURE__*/_jsx(Divider, {
        orientation: "left",
        children: "Welcome"
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['welcome', 'greeting'],
        label: "greeting",
        children: /*#__PURE__*/_jsx(Input, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['welcome', 'description'],
        label: "description",
        children: /*#__PURE__*/_jsx(Input, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['welcome', 'avatar'],
        label: "avatar",
        children: /*#__PURE__*/_jsx(Input, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['welcome', 'prompts'],
        isList: true,
        label: "prompts",
        children: function children(fields, _ref3) {
          var add = _ref3.add,
            remove = _ref3.remove;
          return /*#__PURE__*/_jsx("div", {
            children: fields.map(function (field) {
              return /*#__PURE__*/_jsxs(Flex, {
                gap: 6,
                children: [/*#__PURE__*/_jsx(Form.Item, {
                  style: {
                    flex: 1
                  },
                  name: [field.name, 'value'],
                  children: /*#__PURE__*/_jsx(Input, {})
                }, field.key), /*#__PURE__*/_jsx(IconButton, {
                  icon: /*#__PURE__*/_jsx(SparkPlusLine, {}),
                  onClick: function onClick() {
                    return add({});
                  }
                }), /*#__PURE__*/_jsx(IconButton, {
                  icon: /*#__PURE__*/_jsx(SparkDeleteLine, {}),
                  onClick: function onClick() {
                    return remove(field.name);
                  }
                })]
              }, field.key);
            })
          });
        }
      }), /*#__PURE__*/_jsx(Divider, {
        orientation: "left",
        children: "API"
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['api', 'baseURL'],
        label: "baseURL",
        children: /*#__PURE__*/_jsx(Input, {})
      }), /*#__PURE__*/_jsx(FormItem, {
        name: ['api', 'token'],
        label: "token",
        children: /*#__PURE__*/_jsx(Input, {})
      })]
    }), /*#__PURE__*/_jsxs("div", {
      className: styles.actions,
      children: [/*#__PURE__*/_jsx(Button, {
        onClick: handleReset,
        children: "Reset"
      }), /*#__PURE__*/_jsx(Button, {
        type: "primary",
        onClick: handleSave,
        children: "Save & Copy"
      })]
    })]
  });
};
export default OptionsEditor;