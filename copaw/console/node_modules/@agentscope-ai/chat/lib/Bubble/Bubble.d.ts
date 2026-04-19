import React from 'react';
import type { BubbleProps } from './interface';
export interface BubbleRef {
    /**
     * @description 气泡组件的原生DOM元素引用，用于直接操作DOM
     * @descriptionEn Native DOM element reference of the bubble component for direct DOM manipulation
     */
    nativeElement: HTMLElement;
}
export interface BubbleContextProps {
    /**
     * @description 气泡内容更新时的回调函数，用于触发重新渲染
     * @descriptionEn Callback function when bubble content updates for triggering re-render
     */
    onUpdate?: VoidFunction;
}
export declare const BubbleContext: React.Context<BubbleContextProps>;
declare const _default: React.NamedExoticComponent<BubbleProps<string>>;
export default _default;
