import { useProviderContext } from "./..";
import { theme as AntdTheme } from 'antd';
import { jsx as _jsx } from "react/jsx-runtime";
export default function (props) {
  var _useProviderContext = useProviderContext(),
    theme = _useProviderContext.theme,
    getPrefixCls = _useProviderContext.getPrefixCls;
  var isDarkMode = (theme === null || theme === void 0 ? void 0 : theme.algorithm) === AntdTheme.darkAlgorithm;
  var prefixCls = getPrefixCls('accordion-soft-light-title');
  return /*#__PURE__*/_jsx("div", {
    className: prefixCls,
    style: isDarkMode ? {} : {
      color: 'rgba(38, 36, 76, 0.88)'
    },
    children: props.children
  });
}