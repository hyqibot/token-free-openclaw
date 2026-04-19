/// <reference types="react" />
import { IAgentScopeRuntimeWebUIInputContext } from "../../..";
export declare const ChatAnywhereInputContext: import("use-context-selector").Context<IAgentScopeRuntimeWebUIInputContext>;
export declare function ChatAnywhereInputContextProvider(props: {
    children: React.ReactNode | React.ReactNode[];
}): import("react/jsx-runtime").JSX.Element;
export declare const useChatAnywhereInput: (selector: (v: Partial<IAgentScopeRuntimeWebUIInputContext>) => Partial<IAgentScopeRuntimeWebUIInputContext>) => Partial<IAgentScopeRuntimeWebUIInputContext>;
