import type { ConfigProviderProps, GetProp } from 'antd';
import React from 'react';
export interface GroupTitleProps {
    /**
     * @description 分组标题的内容，支持文本或React元素
     * @descriptionEn Content of the group title, supports text or React elements
     */
    children?: React.ReactNode;
}
export declare const GroupTitleContext: React.Context<{
    prefixCls?: GetProp<ConfigProviderProps, 'prefixCls'>;
}>;
declare const GroupTitle: React.FC<GroupTitleProps>;
export default GroupTitle;
