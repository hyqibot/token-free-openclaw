/// <reference types="react" />
export type Locale = 'cn' | 'en';
declare const messages: {
    cn: {
        'approval.title': string;
        'approval.pending': string;
        'approval.confirmed': string;
        'approval.canceled': string;
        'approval.cancel': string;
        'approval.confirm': string;
        'approval.taskRunning': string;
        'cancelPopover.title': string;
        'cancelPopover.placeholder': string;
        'cancelPopover.cancel': string;
        'cancelPopover.confirm': string;
        'cancelPopover.options.notNeeded': string;
        'cancelPopover.options.poorResult': string;
        'cancelPopover.options.tooSlow': string;
        'cancelPopover.options.wrongInput': string;
        'common.save': string;
        'common.cancel': string;
        'common.confirm': string;
        'common.delete': string;
        'common.edit': string;
        'common.loading': string;
        'common.saveSuccess': string;
        'common.saveFailed': string;
        'actions.regenerate': string;
        'messageImport.title': string;
        'messageImport.placeholder': string;
        'messageImport.saveToLocalStorage': string;
    };
    en: {
        'approval.title': string;
        'approval.pending': string;
        'approval.confirmed': string;
        'approval.canceled': string;
        'approval.cancel': string;
        'approval.confirm': string;
        'approval.taskRunning': string;
        'cancelPopover.title': string;
        'cancelPopover.placeholder': string;
        'cancelPopover.cancel': string;
        'cancelPopover.confirm': string;
        'cancelPopover.options.notNeeded': string;
        'cancelPopover.options.poorResult': string;
        'cancelPopover.options.tooSlow': string;
        'cancelPopover.options.wrongInput': string;
        'common.save': string;
        'common.cancel': string;
        'common.confirm': string;
        'common.delete': string;
        'common.edit': string;
        'common.loading': string;
        'common.saveSuccess': string;
        'common.saveFailed': string;
        'actions.regenerate': string;
        'messageImport.title': string;
        'messageImport.placeholder': string;
        'messageImport.saveToLocalStorage': string;
    };
};
export type MessageKey = keyof typeof messages.cn;
type Messages = Record<MessageKey, string>;
export interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: MessageKey, params?: Record<string, string | number>) => string;
    messages: Messages;
}
declare const ChatAnywhereI18nContext: import("use-context-selector").Context<I18nContextValue>;
export declare function useChatAnywhereI18n<Selected>(selector: (value: I18nContextValue) => Selected): Selected;
export declare function useTranslation(): {
    t: (key: "approval.title" | "approval.pending" | "approval.confirmed" | "approval.canceled" | "approval.cancel" | "approval.confirm" | "approval.taskRunning" | "cancelPopover.title" | "cancelPopover.placeholder" | "cancelPopover.cancel" | "cancelPopover.confirm" | "cancelPopover.options.notNeeded" | "cancelPopover.options.poorResult" | "cancelPopover.options.tooSlow" | "cancelPopover.options.wrongInput" | "common.save" | "common.cancel" | "common.confirm" | "common.delete" | "common.edit" | "common.loading" | "common.saveSuccess" | "common.saveFailed" | "actions.regenerate" | "messageImport.title" | "messageImport.placeholder" | "messageImport.saveToLocalStorage", params?: Record<string, string | number>) => string;
    locale: Locale;
    setLocale: (locale: Locale) => void;
};
export interface ChatAnywhereI18nContextProviderProps {
    children: React.ReactNode;
    defaultLocale?: Locale;
}
export declare function ChatAnywhereI18nContextProvider(props: ChatAnywhereI18nContextProviderProps): import("react/jsx-runtime").JSX.Element;
export default ChatAnywhereI18nContext;
