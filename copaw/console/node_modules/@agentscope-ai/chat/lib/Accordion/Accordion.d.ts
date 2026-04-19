import React from 'react';
export interface IAccordionProps {
    /**
     * @description 组件的当前执行状态，用于显示不同的图标和样式
     * @descriptionEn Current execution status of the component, used to display different icons and styles
     */
    status?: 'finished' | 'interrupted' | 'generating' | 'error';
    /**
     * @description 组件的标题内容，支持文本或React元素
     * @descriptionEn Title content of the component, supports text or React elements
     */
    title: string | React.ReactElement;
    /**
     * @description 组件展开时显示的主要内容
     * @descriptionEn Main content displayed when the component is expanded
     */
    children?: string | React.ReactElement;
    /**
     * @description 自定义图标，会覆盖默认的状态图标
     * @descriptionEn Custom icon that overrides the default status icon
     */
    icon?: string | React.ReactElement;
    /**
     * @description 是否显示图标与内容之间的连接线
     * @descriptionEn Whether to display the connecting line between the icon and content
     */
    iconLine?: boolean;
    /**
     * @description 组件的唯一标识符，用于React的key属性
     * @descriptionEn Unique identifier for the component, used for React's key prop
     */
    id?: string;
    /**
     * @description 显示在标题右侧的额外内容
     * @descriptionEn Additional content displayed on the right side of the title
     */
    rightChildren?: string | React.ReactElement;
    /**
     * @description 子步骤数组，支持递归嵌套结构
     * @descriptionEn Array of child steps, supports recursive nested structure
     */
    steps?: IAccordionProps[];
    /**
     * @description 组件初始化时是否默认展开
     * @descriptionEn Whether the component is expanded by default when initialized
     */
    defaultOpen?: boolean;
    /**
     * @description 受控模式：控制组件是否展开
     * @descriptionEn Controlled mode: controls whether the component is expanded
     */
    open?: boolean;
    /**
     * @description 内容区域的样式对象
     * @descriptionEn Style object for the content area
     */
    bodyStyle?: React.CSSProperties;
    /**
     * @description 是否使用内联模式，影响布局和交互方式
     * @descriptionEn Whether to use inline mode, affects layout and interaction behavior
     */
    inline?: boolean;
}
declare function Accordion(props: IAccordionProps): import("react/jsx-runtime").JSX.Element;
declare namespace Accordion {
    var BodyContent: typeof import("./BodyContent").default;
    var SoftLightTitle: typeof import("./SoftLightTitle").default;
}
export default Accordion;
