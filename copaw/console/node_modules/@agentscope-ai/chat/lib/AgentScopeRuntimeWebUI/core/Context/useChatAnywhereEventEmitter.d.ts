interface IAgentScopeRuntimeWebUIEventEmitter {
    type: string;
    callback: (event: any) => void;
}
export default function useChatAnywhereEventEmitter(props: IAgentScopeRuntimeWebUIEventEmitter, deps?: any[]): void;
export declare const emit: (props: {
    type: string;
    data?: any;
}) => void;
export {};
