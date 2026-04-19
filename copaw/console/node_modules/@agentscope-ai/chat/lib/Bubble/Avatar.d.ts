import React from 'react';
import { BubbleProps } from './interface';
interface AvatarProps extends Pick<BubbleProps, 'avatar' | 'msgStatus' | 'prefixCls'> {
    isAssistant?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
declare const Avatar: React.FC<AvatarProps>;
export default Avatar;
