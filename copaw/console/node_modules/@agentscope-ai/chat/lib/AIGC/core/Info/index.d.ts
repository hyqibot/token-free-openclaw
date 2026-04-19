import React from 'react';
export interface MediaInfoProps {
    /** 自定义类名 */
    className?: string;
    /** 标题文本 */
    title?: string | React.ReactElement;
    /** 描述文本 */
    description?: string | React.ReactElement;
}
declare const MediaInfo: React.FC<MediaInfoProps>;
export default MediaInfo;
