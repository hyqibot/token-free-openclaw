/// <reference types="react" />
import { IAgentScopeRuntimeWebUIOptions } from "../../..";
declare const ChatAnywhereOptionsContext: import("use-context-selector").Context<IAgentScopeRuntimeWebUIOptions>;
export declare function useChatAnywhereOptions<Selected>(selector: (value: IAgentScopeRuntimeWebUIOptions) => Selected): Selected;
export declare function ChatAnywhereOptionsContextProvider(props: {
    children: React.ReactNode;
    options: IAgentScopeRuntimeWebUIOptions;
}): import("react/jsx-runtime").JSX.Element;
export default ChatAnywhereOptionsContext;
