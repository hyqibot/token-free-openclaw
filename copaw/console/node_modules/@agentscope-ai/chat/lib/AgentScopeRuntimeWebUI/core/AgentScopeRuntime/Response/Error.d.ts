import { IAgentScopeRuntimeError, IAgentScopeRuntimeMessage } from "../types";
export default function Error({ data }: {
    data: IAgentScopeRuntimeError | IAgentScopeRuntimeMessage;
}): import("react/jsx-runtime").JSX.Element;
