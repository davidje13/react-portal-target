import { FunctionComponent, ReactNode } from 'react';
declare const PortalContext: FunctionComponent<{
    children: ReactNode;
}>;
declare const usePortalSource: (name: string, content: ReactNode) => void;
declare const usePortalTarget: (name: string, fallbackContent?: ReactNode) => ReactNode;
declare const PortalSource: FunctionComponent<{
    name: string;
    children?: ReactNode;
}>;
declare const PortalTarget: FunctionComponent<{
    name: string;
    children?: ReactNode;
}>;
export { PortalContext, PortalSource, PortalTarget, usePortalSource, usePortalTarget, };
