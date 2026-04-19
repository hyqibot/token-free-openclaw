/// <reference types="react" />
import { IAgentScopeRuntimeWebUIMessage } from "../../../..";
import { InputProps } from "../Input";
interface UseChatMessageHandlerOptions {
    currentQARef: React.MutableRefObject<{
        request?: IAgentScopeRuntimeWebUIMessage;
        response?: IAgentScopeRuntimeWebUIMessage;
        abortController?: AbortController;
    }>;
}
/**
 * 处理消息创建和更新的 Hook
 */
export default function useChatMessageHandler(options: UseChatMessageHandlerOptions): {
    createRequestMessage: (data: Parameters<InputProps['onSubmit']>[0]) => IAgentScopeRuntimeWebUIMessage<any>;
    createApprovalMessage: (data: any) => IAgentScopeRuntimeWebUIMessage<any>;
    createResponseMessage: () => IAgentScopeRuntimeWebUIMessage<any>;
    getHistoryMessages: () => any[];
    updateMessage: (message: Partial<IAgentScopeRuntimeWebUIMessage<any>> & {
        id: string;
    }) => void;
    removeMessageById: (id: string) => void;
    getMessages: () => IAgentScopeRuntimeWebUIMessage<any>[];
};
export {};
