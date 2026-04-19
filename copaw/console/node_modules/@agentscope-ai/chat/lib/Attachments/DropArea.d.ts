import React from 'react';
export interface DropUploaderProps {
    /**
     * @description 自定义CSS类名前缀，用于样式隔离和主题定制
     * @descriptionEn Custom CSS class name prefix for style isolation and theme customization
     */
    prefixCls: string;
    /**
     * @description 拖拽区域的CSS类名
     * @descriptionEn CSS class name for the drop area
     */
    className: string;
    /**
     * @description 获取拖拽容器的函数，用于自定义拖拽区域
     * @descriptionEn Function to get drop container for customizing drop area
     */
    getDropContainer?: null | (() => HTMLElement | null | undefined);
    /**
     * @description 拖拽区域内的子元素，用于显示拖拽提示内容
     * @descriptionEn Child elements within the drop area for displaying drop prompt content
     */
    children?: React.ReactNode;
}
export default function DropArea(props: DropUploaderProps): React.ReactPortal;
