import { IImage, IVideo, IAudio } from './types';
export interface IAssetsPreviewProps {
    /**
     * @description 类名
     * @descriptionEn Class Name
     * @default ''
     */
    className?: string;
    /**
     * @description 语义化类名
     * @descriptionEn Semantic Class Name
     * @default {}
     */
    classNames?: {
        container?: string;
    };
    /**
     * @description 高度
     * @descriptionEn Height
     * @default 144
     */
    height?: number;
    /**
     * @description 类型
     * @descriptionEn Type
     * @default 'image'
     */
    type: 'image' | 'video' | 'audio';
    /**
     * @description 数据
     * @descriptionEn Data
     * @default []
     */
    data: (IImage | IVideo | IAudio)[];
}
declare function AssetsPreview(props: IAssetsPreviewProps): import("react/jsx-runtime").JSX.Element;
export default AssetsPreview;
