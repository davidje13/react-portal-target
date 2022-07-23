import {
  createContext,
  createElement,
  Fragment,
  FunctionComponent,
  ReactNode,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

type ID = {};

class PrimaryTracker<T> {
  private readonly values = new Map<ID | null, T>();
  private primaryId: ID | null = null;

  constructor(
    private readonly onChangePrimary: (value: T | undefined) => void,
  ) {
    this.values = new Map();
  }

  store(value: T) {
    const id: ID = {};
    this.values.set(id, value);
    if (!this.primaryId) {
      this.primaryId = id;
      this.onChangePrimary(value);
    }
    return () => {
      this.values.delete(id);
      if (this.primaryId === id) {
        const next = this.values.entries().next();
        this.primaryId = next.done ? null : next.value[0];
        this.onChangePrimary(next.done ? undefined : next.value[1]);
      }
    };
  }

  get() {
    return this.values.get(this.primaryId);
  }

  isEmpty() {
    return !this.primaryId;
  }
}

class Portal<T> {
  public readonly sources = new PrimaryTracker<T>(this.update.bind(this));
  public readonly targets = new PrimaryTracker<(v: T | undefined) => void>(
    this.update.bind(this),
  );

  constructor(private readonly destructor: () => void) {}

  private update() {
    const target = this.targets.get();
    if (target) {
      target(this.sources.get());
    } else if (this.sources.isEmpty()) {
      this.destructor();
    }
  }
}

class PortalMap<T> {
  private readonly portals = new Map<string, Portal<T>>();

  get(name: string) {
    let portal = this.portals.get(name);
    if (!portal) {
      portal = new Portal(() => this.portals.delete(name));
      this.portals.set(name, portal);
    }
    return portal;
  }
}

const PortalCtx = createContext(new PortalMap<ReactNode>());

export const PortalContext: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [map] = useState(() => new PortalMap<ReactNode>());
  return createElement(PortalCtx.Provider, { value: map }, children);
};

export const usePortalSource = (name: string, content: ReactNode) => {
  const ctx = useContext(PortalCtx);
  useLayoutEffect(
    () => ctx.get(name).sources.store(content),
    [ctx, name, content],
  );
};

export const usePortalTarget = (name: string): ReactNode => {
  const ctx = useContext(PortalCtx);
  const [content, setContent] = useState<ReactNode>(undefined);
  useLayoutEffect(
    () => ctx.get(name).targets.store(setContent),
    [ctx, name, setContent],
  );
  return content;
};

export const PortalSource: FunctionComponent<{
  name: string;
  children?: ReactNode;
}> = ({ name, children }) => {
  usePortalSource(name, children);
  return null;
};

export const PortalTarget: FunctionComponent<{ name: string }> = ({ name }) =>
  createElement(Fragment, {}, usePortalTarget(name));
