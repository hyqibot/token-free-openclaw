import React from 'react';
import { TMessage, TSession } from './types';
export declare function useSessionList(): {
    currentRegenerateIndex: number;
    setCurrentRegenerateIndex: React.Dispatch<React.SetStateAction<number>>;
    getCurrentRegenerateIndex: () => number;
    sessionList: TSession[];
    setSessionList: React.Dispatch<React.SetStateAction<TSession[]>>;
    getSessionList: () => TSession[];
    currentSessionKey: string;
    setCurrentSessionKey: React.Dispatch<React.SetStateAction<string>>;
    sessionListShow: boolean;
    setSessionListShow: React.Dispatch<React.SetStateAction<boolean>>;
    createSession: () => string;
    deleteSession: (key: string) => void;
    updateSessionMessages: (messages: TMessage[]) => void;
    getMessagesBySession: (currentSessionKey: any, currentRegenerateIndex: any) => TMessage[];
    getSession: () => {
        sessionList: TSession[];
        currentSessionKey: string;
        currentRegenerateIndex: number;
    };
    updateSession: (data: any) => void;
};
