interface IProps {
    data: {
        block?: boolean;
        title?: string;
        subTitle?: string;
        loading?: boolean;
        content?: string;
        className?: string;
        defaultOpen?: boolean;
        open?: boolean;
        autoCloseOnFinish?: boolean;
        maxHeight?: number;
    };
}
export default function (props: IProps): import("react/jsx-runtime").JSX.Element;
export {};
