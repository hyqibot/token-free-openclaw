import React from 'react';
import type { DraggerProps } from 'antd/es/upload';
import { IChatAnywhereConfigOnUpload } from "../../../ChatAnywhere/hooks/types";
type MediaUploadProps = Omit<DraggerProps, keyof IChatAnywhereConfigOnUpload> & IChatAnywhereConfigOnUpload & {
    className?: string;
};
declare const MediaUpload: React.FC<MediaUploadProps>;
export default MediaUpload;
