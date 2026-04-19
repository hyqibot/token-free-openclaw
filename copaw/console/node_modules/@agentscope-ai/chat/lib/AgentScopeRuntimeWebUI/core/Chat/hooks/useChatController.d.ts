/**
 * 聊天控制器 Hook - 协调所有聊天相关操作
 */
export default function useChatController(): {
    handleSubmit: (data: import("../../../..").IAgentScopeRuntimeWebUIInputData) => void;
    handleCancel: () => void;
};
