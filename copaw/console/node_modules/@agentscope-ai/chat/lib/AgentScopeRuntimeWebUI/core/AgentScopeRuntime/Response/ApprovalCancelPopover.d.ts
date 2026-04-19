export interface ApprovalCancelPopoverProps {
    /**
     * @description 预设的取消原因选项
     * @descriptionEn Preset cancel reason options
     */
    options?: string[];
    /**
     * @description 确认回调
     * @descriptionEn Confirm callback
     */
    onConfirm?: (reason: string) => void;
    /**
     * @description 标题
     * @descriptionEn Title
     * @default '取消原因'
     */
    title?: string;
    /**
     * @description 文本框占位符
     * @descriptionEn Textarea placeholder
     * @default '请输入原因，以便大模型做进一步规划'
     */
    placeholder?: string;
}
export default function ApprovalCancelPopover(props: ApprovalCancelPopoverProps): import("react/jsx-runtime").JSX.Element;
