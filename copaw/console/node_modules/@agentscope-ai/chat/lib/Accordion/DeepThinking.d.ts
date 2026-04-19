export interface IDeepThinking {
    /**
     * @description 深度思考过程的标题，用于描述思考的主题或方向
     * @descriptionEn Title of the deep thinking process for describing the topic or direction of thinking
     */
    title?: string;
    /**
     * @description 是否正在生成思考内容，影响显示状态和动画效果
     * @descriptionEn Whether the thinking content is being generated, affects display state and animation effects
     */
    loading?: boolean;
    /**
     * @description 深度思考的具体内容，包含思考过程和结果
     * @descriptionEn Specific content of deep thinking, including thinking process and results
     */
    content?: string;
    /**
     * @description 组件初始化时是否默认展开，控制初始显示状态
     * @descriptionEn Whether to expand by default when component initializes, controls initial display state
     */
    defaultOpen?: boolean;
    /**
     * @description 受控模式：控制组件是否展开
     * @descriptionEn Controlled mode: controls whether the component is expanded
     */
    open?: boolean;
    /**
     * @description 生成结束后是否自动关闭（默认 false）
     * @descriptionEn Whether to automatically close after generation is complete (default false)
     */
    autoCloseOnFinish?: boolean;
    /**
     * @description 内容区域的最大高度（单位：像素）
     * @descriptionEn Maximum height of the content area (in pixels)
     */
    maxHeight?: number;
    /**
     * @description 组件的CSS类名，用于自定义样式
     * @descriptionEn CSS class name for the component for custom styling
     */
    className?: string;
}
export default function (props: IDeepThinking): import("react/jsx-runtime").JSX.Element;
