import { IAgentScopeRuntimeWebUIMessage, IAgentScopeRuntimeWebUIMessagesContext } from "../../..";
import React from "react";
export declare const ChatAnywhereMessagesContext: import("use-context-selector").Context<IAgentScopeRuntimeWebUIMessagesContext>;
export declare function ChatAnywhereMessagesContextProvider(props: {
    children: React.ReactNode | React.ReactNode[];
}): import("react/jsx-runtime").JSX.Element;
export declare const useChatAnywhereMessages: () => {
    getMessages: () => IAgentScopeRuntimeWebUIMessage<any>[];
    removeAllMessages: () => void;
    getMessage: (id: string) => IAgentScopeRuntimeWebUIMessage<any>;
    removeMessage: (message: Partial<IAgentScopeRuntimeWebUIMessage>) => void;
    updateMessage: (message: Partial<IAgentScopeRuntimeWebUIMessage> & {
        id: string;
    }) => void;
};
