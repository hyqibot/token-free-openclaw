/// <reference types="react" />
declare const _default: {
    SenderHeader: import("react").FC<import("./core/SenderHeader").SenderHeaderProps>;
    Info: import("react").FC<import("./core/Info").MediaInfoProps>;
    Upload: import("react").FC<Omit<import("antd").DraggerProps, keyof import("../ChatAnywhere/hooks/types").IChatAnywhereConfigOnUpload> & import("../ChatAnywhere/hooks/types").IChatAnywhereConfigOnUpload & {
        className?: string;
    }>;
};
export default _default;
