import React, { ReactElement } from 'react';
declare function Footer(props: {
    left?: React.ReactElement;
    right?: React.ReactElement;
}): import("react/jsx-runtime").JSX.Element;
declare namespace Footer {
    var Actions: typeof FooterActions;
    var Count: typeof FooterCount;
}
export default Footer;
interface IAction {
    icon: string | ReactElement;
    label?: string;
    onClick: () => void;
    children?: React.ReactElement;
}
export declare function FooterActions(props: {
    data: (IAction)[];
}): import("react/jsx-runtime").JSX.Element;
export declare function FooterCount(props: {
    data: [string | number, string | number][];
}): import("react/jsx-runtime").JSX.Element;
