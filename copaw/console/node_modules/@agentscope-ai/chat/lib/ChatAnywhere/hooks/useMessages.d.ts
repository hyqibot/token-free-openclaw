import React from 'react';
import { TMessage } from './types';
export declare function useMessages(): {
    messages: TMessage[];
    getMessage: (id: string) => TMessage;
    setMessages: React.Dispatch<React.SetStateAction<TMessage[]>>;
    getMessages: () => TMessage[];
    updateMessage: {
        (message: Partial<TMessage> & {
            id: string;
        }): void;
        (id: string, message: Partial<TMessage> & {
            id: string;
        }): void;
    };
    removeMessage: (message: Partial<TMessage>) => void;
    removeAllMessages: () => void;
};
