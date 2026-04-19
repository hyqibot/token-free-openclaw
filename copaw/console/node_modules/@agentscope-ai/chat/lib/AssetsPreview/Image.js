import { useProviderContext } from "..";
import { Image, ConfigProvider } from 'antd';
import { jsx as _jsx } from "react/jsx-runtime";
export default function (props) {
  var prefixCls = useProviderContext().getPrefixCls('assets-preview-image');
  var _props$width = props.width,
    width = _props$width === void 0 ? 1 : _props$width,
    _props$height = props.height,
    height = _props$height === void 0 ? 1 : _props$height,
    src = props.src;
  return /*#__PURE__*/_jsx("div", {
    className: prefixCls,
    style: {
      aspectRatio: "".concat(width, "/").concat(height)
    },
    children: /*#__PURE__*/_jsx(ConfigProvider, {
      locale: {
        Image: {
          preview: ''
        }
      },
      children: /*#__PURE__*/_jsx(Image, {
        src: src,
        width: "100%",
        height: "100%"
      })
    })
  });
}
export function ImagesContainer(props) {
  return /*#__PURE__*/_jsx(Image.PreviewGroup, {
    children: props.children
  });
}