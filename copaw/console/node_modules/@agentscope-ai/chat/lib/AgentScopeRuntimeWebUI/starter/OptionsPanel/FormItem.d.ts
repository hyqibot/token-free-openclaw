interface FormItemProps {
    name: string | string[];
    label: string;
    isList?: boolean;
    children: any;
    normalize?: (value: any) => any;
}
export default function FormItem(props: FormItemProps): import("react/jsx-runtime").JSX.Element;
export {};
