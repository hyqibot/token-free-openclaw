import { Bubble } from "../../../..";
import { jsx as _jsx } from "react/jsx-runtime";
export default function Error(_ref) {
  var data = _ref.data;
  return /*#__PURE__*/_jsx(Bubble.Interrupted, {
    type: "error",
    title: data.code,
    desc: data.message
  });
}