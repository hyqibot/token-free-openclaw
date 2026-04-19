import React from 'react';
import { IChatAnywhereConfigOnUpload } from "../../../ChatAnywhere/hooks/types";
import { Attachments } from "../../..";
import { GetProp } from 'antd';
type AttachedFiles = GetProp<typeof Attachments, 'items'>;
export interface SenderHeaderProps {
    className?: string;
    onUpload?: IChatAnywhereConfigOnUpload[];
    attachedFiles?: AttachedFiles[];
    onFileChange?: (index: number, fileList: AttachedFiles) => void;
}
declare const SenderHeader: React.FC<SenderHeaderProps>;
export default SenderHeader;
