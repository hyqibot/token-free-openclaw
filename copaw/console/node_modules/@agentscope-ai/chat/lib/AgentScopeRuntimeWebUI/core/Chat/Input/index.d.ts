import { IAgentScopeRuntimeWebUIInputData } from "../../../..";
export interface InputProps {
    onCancel: () => void;
    onSubmit: (data: IAgentScopeRuntimeWebUIInputData) => void;
}
export default function Input(props: InputProps): import("react/jsx-runtime").JSX.Element;
