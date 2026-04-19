import { Form } from 'antd';
import { createStyles } from 'antd-style';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var token = _ref.token,
    css = _ref.css;
  return {
    label: {
      marginBottom: 6,
      fontSize: 12,
      color: token.colorTextSecondary
    }
  };
});
export default function FormItem(props) {
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var node = props.isList ? /*#__PURE__*/_jsx(Form.List, {
    name: props.name,
    children: props.children
  }) : /*#__PURE__*/_jsx(Form.Item, {
    name: props.name,
    normalize: props.normalize,
    children: props.children
  });
  return /*#__PURE__*/_jsxs("div", {
    children: [props.label && /*#__PURE__*/_jsx("div", {
      className: styles.label,
      children: props.label
    }), node]
  });
}