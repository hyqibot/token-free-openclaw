import React from 'react';
import type { Conversation, Groupable } from './interface';
export interface ConversationsProps extends React.HTMLAttributes<HTMLUListElement> {
    /**
     * @description 会话列表的数据源数组，包含所有会话信息
     * @descriptionEn Data source array for the conversation list containing all conversation information
     */
    items?: Conversation[];
    /**
     * @description 当前激活的会话标识符，用于高亮显示选中项
     * @descriptionEn Currently active conversation identifier for highlighting selected item
     */
    activeKey?: Conversation['key'];
    /**
     * @description 组件初始化时的默认选中会话标识符
     * @descriptionEn Default selected conversation identifier when component initializes
     */
    defaultActiveKey?: Conversation['key'];
    /**
     * @description 会话选择发生变化时的回调函数，接收新的会话标识符
     * @descriptionEn Callback function when conversation selection changes, receives new conversation identifier
     */
    onActiveChange?: (value: string) => void;
    /**
     * @description 是否开启批量选择模式
     * @descriptionEn Whether to enable batch selection mode
     */
    selectable?: boolean;
    /**
     * @description 当前选中的会话 key 列表
     * @descriptionEn Currently selected conversation key list
     */
    selectedKeys?: string[];
    /**
     * @description 批量选择变化时的回调函数
     * @descriptionEn Callback when batch selection changes
     */
    onSelectChange?: (selectedKeys: string[]) => void;
    /**
     * @description 会话操作菜单配置
     * @descriptionEn Conversation operation menu configuration
     */
    menu?: {
        label?: string;
        key?: string;
        icon?: React.ReactNode;
        danger?: boolean;
        onClick?: (info: Conversation) => void;
        onEdit?: (label: string, session: Conversation) => Promise<void>;
        disabled?: boolean;
    }[];
    /**
     * @description 语义化样式对象，用于精确控制不同区域的样式
     * @descriptionEn Semantic style object for precise control of different area styles
     */
    styles?: Partial<Record<'item', React.CSSProperties>>;
    /**
     * @description 语义化CSS类名，用于为不同区域添加自定义类名
     * @descriptionEn Semantic CSS class names for adding custom classes to different areas
     */
    classNames?: Partial<Record<'item', string>>;
    /**
     * @description 自定义CSS类名前缀，用于样式隔离和主题定制
     * @descriptionEn Custom CSS class name prefix for style isolation and theme customization
     */
    prefixCls?: string;
    /**
     * @description 自定义根容器的CSS类名，用于覆盖默认样式
     * @descriptionEn Custom CSS class name for the root container to override default styles
     */
    rootClassName?: string;
}
declare const Conversations: React.FC<ConversationsProps & {
    groupable?: boolean | Groupable;
}>;
export type { Conversation };
export default Conversations;
