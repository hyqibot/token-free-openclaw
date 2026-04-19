export interface ProgressProps {
    /**
     * @description 自定义CSS类名前缀，用于样式隔离和主题定制
     * @descriptionEn Custom CSS class name prefix for style isolation and theme customization
     */
    prefixCls: string;
    /**
     * @description 进度百分比值，范围0-100，用于显示上传进度
     * @descriptionEn Progress percentage value, range 0-100, for displaying upload progress
     */
    percent: number;
}
export default function Progress(props: ProgressProps): import("react/jsx-runtime").JSX.Element;
