import { IAgentScopeRuntimeWebUIMessage } from "../../../..";
/**
 * 处理会话创建和更新的 Hook
 */
export default function useChatSessionHandler(): {
    ensureSession: (query: string) => Promise<void>;
    updateSessionName: (query: string, messages: IAgentScopeRuntimeWebUIMessage[]) => Promise<void>;
    syncSessionMessages: (messages: IAgentScopeRuntimeWebUIMessage[]) => Promise<void>;
    getCurrentSessionId: () => string;
};
