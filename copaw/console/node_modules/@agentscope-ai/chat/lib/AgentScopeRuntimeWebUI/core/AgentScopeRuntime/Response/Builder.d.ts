import { IAgentScopeRuntimeResponse, AgentScopeRuntimeRunStatus, IAgentScopeRuntimeMessage, IContent } from "../types";
declare class AgentScopeRuntimeResponseBuilder {
    static mergeToolMessages(messages: IAgentScopeRuntimeMessage[]): IAgentScopeRuntimeMessage[];
    static maybeToolOutput(message: IAgentScopeRuntimeMessage): boolean;
    static maybeToolInput(message: IAgentScopeRuntimeMessage): boolean;
    static maybeGenerating(data: {
        status: AgentScopeRuntimeRunStatus;
    }): boolean;
    static maybeDone(data: {
        status: AgentScopeRuntimeRunStatus;
    }): boolean;
    data: IAgentScopeRuntimeResponse;
    constructor({ id, status, created_at }: Pick<IAgentScopeRuntimeResponse, 'id' | 'status' | 'created_at'>);
    handleResponse(data: IAgentScopeRuntimeResponse): void;
    handleMessage(data: IAgentScopeRuntimeMessage): void;
    handleContent(data: IContent): void;
    handleError(data: IAgentScopeRuntimeMessage): void;
    handle(data: IAgentScopeRuntimeResponse | IAgentScopeRuntimeMessage | IContent): IAgentScopeRuntimeResponse;
    cancel(): IAgentScopeRuntimeResponse;
}
export default AgentScopeRuntimeResponseBuilder;
