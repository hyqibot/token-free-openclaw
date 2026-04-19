import React from 'react';
interface ICardProps {
    code: string;
    component?: React.FC;
    data?: string | any;
    index?: number;
    id?: string;
    isLast?: boolean;
}
export default function Cards(props: {
    cards: ICardProps[];
    id: string;
    className?: string;
    isLast?: boolean;
}): import("react/jsx-runtime").JSX.Element[];
export declare function createCard(code: string, data: any): {
    code: string;
    data: any;
};
export {};
