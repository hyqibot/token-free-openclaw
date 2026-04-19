import { type UploadProps } from 'antd';
import React from 'react';
export interface PlaceholderConfig {
    /**
     * @description 占位符的图标元素，用于视觉引导
     * @descriptionEn Icon element for the placeholder for visual guidance
     */
    icon?: React.ReactNode;
    /**
     * @description 占位符的主标题文本，用于说明功能
     * @descriptionEn Main title text for the placeholder for explaining functionality
     */
    title?: React.ReactNode;
    /**
     * @description 占位符的描述文本，用于提供详细说明
     * @descriptionEn Description text for the placeholder for providing detailed explanation
     */
    description?: React.ReactNode;
}
export type PlaceholderType = PlaceholderConfig | React.ReactElement;
export interface PlaceholderProps {
    /**
     * @description 自定义CSS类名前缀，用于样式隔离和主题定制
     * @descriptionEn Custom CSS class name prefix for style isolation and theme customization
     */
    prefixCls: string;
    /**
     * @description 占位符配置，支持配置对象或自定义React元素
     * @descriptionEn Placeholder configuration, supports config object or custom React elements
     */
    placeholder?: PlaceholderType;
    /**
     * @description 上传组件的属性配置，用于控制上传行为
     * @descriptionEn Upload component props configuration for controlling upload behavior
     */
    upload?: UploadProps;
    /**
     * @description 组件的CSS类名
     * @descriptionEn CSS class name for the component
     */
    className?: string;
    /**
     * @description 组件的内联样式对象
     * @descriptionEn Inline style object for the component
     */
    style?: React.CSSProperties;
}
declare const _default: React.ForwardRefExoticComponent<PlaceholderProps & React.RefAttributes<import("antd/es/upload/Upload").UploadRef<any>>>;
export default _default;
