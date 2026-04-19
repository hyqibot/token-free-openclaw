import { Accordion } from "./..";
import { useProviderContext } from "./..";
import { theme as AntdTheme } from 'antd';
import cls from 'classnames';
import { jsx as _jsx } from "react/jsx-runtime";
export default function (props) {
  var _useProviderContext = useProviderContext(),
    providerTheme = _useProviderContext.theme,
    getPrefixCls = _useProviderContext.getPrefixCls;
  var prefixCls = getPrefixCls('accordion-deep-thinking');
  var isDarkMode = (providerTheme === null || providerTheme === void 0 ? void 0 : providerTheme.algorithm) === AntdTheme.darkAlgorithm;
  var icon = /*#__PURE__*/_jsx("img", {
    style: {
      display: 'block',
      width: 16,
      height: 16,
      filter: isDarkMode ? 'invert(1)  brightness(100%) saturate(0%)' : ''
    },
    src: "https://img.alicdn.com/imgextra/i2/O1CN01QZgWRv1I4JM0BAZ9O_!!6000000000839-54-tps-56-56.apng"
  });

  // 构建标题文本
  var titleText = props.title || 'Deep thinking';
  if (props.loading) {
    titleText += '...';
  }

  // 构建标题
  var title = props.loading ? /*#__PURE__*/_jsx(Accordion.SoftLightTitle, {
    children: titleText
  }) : titleText;

  // 构建 bodyStyle，添加 maxHeight 支持
  var bodyStyle = props.maxHeight ? {
    maxHeight: props.maxHeight,
    overflowY: 'auto'
  } : {};

  // 确定默认展开状态：如果设置了 autoCloseOnFinish 且不在 loading 状态，默认关闭
  var finalDefaultOpen = props.defaultOpen !== undefined ? props.defaultOpen : props.autoCloseOnFinish && !props.loading ? false : undefined;
  return /*#__PURE__*/_jsx(Accordion, {
    title: title,
    status: props.loading ? 'generating' : 'finished',
    icon: props.loading ? icon : null,
    defaultOpen: finalDefaultOpen,
    open: props.open,
    bodyStyle: bodyStyle,
    inline: true,
    children: /*#__PURE__*/_jsx("div", {
      className: cls(prefixCls, props.className),
      children: props.content || '...'
    })
  });
}