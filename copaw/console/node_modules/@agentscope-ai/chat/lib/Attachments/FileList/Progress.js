import { Progress as AntdProgress, theme } from 'antd';
import { jsxs as _jsxs } from "react/jsx-runtime";
import { jsx as _jsx } from "react/jsx-runtime";
export default function Progress(props) {
  var percent = props.percent;
  var _theme$useToken = theme.useToken(),
    token = _theme$useToken.token;
  return /*#__PURE__*/_jsx(AntdProgress, {
    type: "circle",
    percent: percent,
    size: 40,
    strokeColor: "#FFF",
    trailColor: "rgba(255, 255, 255, 0.3)",
    format: function format(ptg) {
      return /*#__PURE__*/_jsxs("span", {
        style: {
          color: '#FFF'
        },
        children: [(ptg || 0).toFixed(0), "%"]
      });
    }
  });
}