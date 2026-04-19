var _excluded = ["render"];
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import { useChatAnywhereOptions } from "../../Context/ChatAnywhereOptionsContext";
import WelcomePrompts from "../../../../WelcomePrompts";
import { jsx as _jsx } from "react/jsx-runtime";
export default function Welcome(props) {
  var welcomeOptions = useChatAnywhereOptions(function (v) {
    return v.welcome;
  });
  if (!welcomeOptions) return null;
  var render = welcomeOptions.render,
    otherWelcomeOptions = _objectWithoutProperties(welcomeOptions, _excluded);
  if (render) return welcomeOptions.render({
    greeting: welcomeOptions.greeting,
    avatar: welcomeOptions.avatar,
    description: welcomeOptions.description,
    prompts: welcomeOptions.prompts,
    onSubmit: props.onSubmit
  });
  var greeting = otherWelcomeOptions.greeting,
    avatar = otherWelcomeOptions.avatar,
    prompts = otherWelcomeOptions.prompts,
    description = otherWelcomeOptions.description;
  return /*#__PURE__*/_jsx(WelcomePrompts, {
    greeting: greeting,
    avatar: avatar,
    description: description,
    prompts: prompts,
    onClick: function onClick(query) {
      return props.onSubmit({
        query: query
      });
    }
  });
}