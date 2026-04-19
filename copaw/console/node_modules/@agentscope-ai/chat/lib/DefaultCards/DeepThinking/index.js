import React from 'react';
import { DeepThinking } from "../..";
import { jsx as _jsx } from "react/jsx-runtime";
export default function (props) {
  return /*#__PURE__*/_jsx(DeepThinking, {
    defaultOpen: props.data.defaultOpen !== undefined ? props.data.defaultOpen : true,
    title: props.data.title,
    loading: props.data.loading,
    content: props.data.content,
    className: props.data.className,
    open: props.data.open,
    autoCloseOnFinish: props.data.autoCloseOnFinish,
    maxHeight: props.data.maxHeight
  });
}