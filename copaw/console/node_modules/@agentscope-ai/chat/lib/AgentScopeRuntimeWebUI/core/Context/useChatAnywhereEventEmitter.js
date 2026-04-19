import { useEffect } from "react";
export default function useChatAnywhereEventEmitter(props) {
  var deps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  useEffect(function () {
    document.addEventListener(props.type, props.callback);
    return function () {
      document.removeEventListener(props.type, props.callback);
    };
  }, deps);
}
export var emit = function emit(props) {
  var type = props.type,
    data = props.data;
  document.dispatchEvent(new CustomEvent(type, {
    detail: data
  }));
};