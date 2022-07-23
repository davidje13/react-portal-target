import { FunctionComponent, ReactNode } from 'react';
export declare const PortalContext: FunctionComponent<{
    children: ReactNode;
}>;
export declare const usePortalSource: (name: string, content: ReactNode) => void;
export declare const usePortalTarget: (name: string) => ReactNode;
export declare const PortalSource: FunctionComponent<{
    name: string;
    children?: ReactNode;
}>;
export declare const PortalTarget: FunctionComponent<{
    name: string;
}>;
