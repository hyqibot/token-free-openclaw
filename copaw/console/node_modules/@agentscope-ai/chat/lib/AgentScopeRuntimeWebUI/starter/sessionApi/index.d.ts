import { IAgentScopeRuntimeWebUISessionAPI } from "../../..";
import { IAgentScopeRuntimeWebUISession } from '../../core/types/ISessions';
declare class SessionApi implements IAgentScopeRuntimeWebUISessionAPI {
    private lsKey;
    private sessionList;
    constructor();
    getSessionList(): Promise<IAgentScopeRuntimeWebUISession[]>;
    getSession(sessionId: any): Promise<IAgentScopeRuntimeWebUISession>;
    updateSession(session: any): Promise<IAgentScopeRuntimeWebUISession[]>;
    createSession(session: any): Promise<IAgentScopeRuntimeWebUISession[]>;
    removeSession(session: any): Promise<IAgentScopeRuntimeWebUISession[]>;
}
declare const _default: SessionApi;
export default _default;
