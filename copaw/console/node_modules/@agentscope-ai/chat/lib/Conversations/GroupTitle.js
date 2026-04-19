import { Typography } from 'antd';
import classnames from 'classnames';
import React from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
export var GroupTitleContext = /*#__PURE__*/React.createContext(null);
var GroupTitle = function GroupTitle(_ref) {
  var children = _ref.children;
  var _React$useContext = React.useContext(GroupTitleContext),
    prefixCls = _React$useContext.prefixCls;
  return /*#__PURE__*/_jsx("div", {
    className: classnames("".concat(prefixCls, "-group-title")),
    children: children && /*#__PURE__*/_jsx(Typography.Text, {
      children: children
    })
  });
};
export default GroupTitle;