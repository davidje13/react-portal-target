import { FunctionComponent, ReactNode } from 'react';
declare const PortalContext: FunctionComponent<{
    children: ReactNode;
}>;
declare const usePortalSource: (name: string, content: ReactNode) => void;
declare const usePortalTarget: (name: string) => ReactNode;
declare const PortalSource: FunctionComponent<{
    name: string;
    children?: ReactNode;
}>;
declare const PortalTarget: FunctionComponent<{
    name: string;
}>;
export { PortalContext, PortalSource, PortalTarget, usePortalSource, usePortalTarget, };
