import React from 'react';
export declare function useInput(): {
    loading: boolean;
    disabled: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
    getLoading: () => boolean;
    getDisabled: () => boolean;
};
