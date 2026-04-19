import { useChatAnywhere } from "./ChatAnywhereProvider";
export function useInput() {
  var _useChatAnywhere = useChatAnywhere(function (v) {
      return {
        loading: v.loading,
        getLoading: v.getLoading,
        disabled: v.disabled,
        getDisabled: v.getDisabled,
        setLoading: v.setLoading,
        setDisabled: v.setDisabled
      };
    }),
    loading = _useChatAnywhere.loading,
    disabled = _useChatAnywhere.disabled,
    setLoading = _useChatAnywhere.setLoading,
    setDisabled = _useChatAnywhere.setDisabled,
    getLoading = _useChatAnywhere.getLoading,
    getDisabled = _useChatAnywhere.getDisabled;
  return {
    loading: loading,
    disabled: disabled,
    setLoading: setLoading,
    setDisabled: setDisabled,
    getLoading: getLoading,
    getDisabled: getDisabled
  };
}