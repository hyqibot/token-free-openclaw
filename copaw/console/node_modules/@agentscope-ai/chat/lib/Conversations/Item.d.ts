import React from 'react';
import type { DirectionType } from 'antd/es/config-provider';
import type { Conversation } from './interface';
export interface ConversationsItemProps extends Omit<React.HTMLAttributes<HTMLLIElement>, 'onClick' | 'onSelect'> {
    info: Conversation;
    prefixCls?: string;
    direction?: DirectionType;
    menu?: {
        label?: string;
        key?: string;
        icon?: React.ReactNode;
        danger?: boolean;
        onClick?: (info: Conversation) => void;
        onEdit?: (label: string, session: Conversation) => Promise<void>;
        disabled?: boolean;
    }[];
    active?: boolean;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (key: string, selected: boolean) => void;
    onClick?: (info: Conversation) => void;
}
export declare function useEditable(id: any): any[];
declare const ConversationsItem: React.FC<ConversationsItemProps>;
export default ConversationsItem;
