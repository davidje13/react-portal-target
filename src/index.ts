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

  constructor(private readonly onChange: () => void) {}

  store(value: T) {
    const id: ID = {};
    this.values.set(id, value);
    if (!this.primaryId) {
      this.primaryId = id;
      this.onChange();
    }
    return () => {
      this.values.delete(id);
      if (this.primaryId === id) {
        const next = this.values.keys().next();
        this.primaryId = next.done ? null : next.value;
        this.onChange();
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
  private readonly update = () => {
    const target = this.targets.get();
    if (target) {
      target(this.sources.get());
    } else if (this.sources.isEmpty()) {
      this.destructor();
    }
  };

  public readonly sources = new PrimaryTracker<T>(this.update);
  public readonly targets = new PrimaryTracker<(v: T | undefined) => void>(
    this.update,
  );

  constructor(private readonly destructor: () => void) {}
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

const PortalContext: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [map] = useState(() => new PortalMap<ReactNode>());
  return createElement(PortalCtx.Provider, { value: map }, children);
};

const usePortalSource = (name: string, content: ReactNode) => {
  const ctx = useContext(PortalCtx);
  useLayoutEffect(
    () => ctx.get(name).sources.store(content),
    [ctx, name, content],
  );
};

const usePortalTarget = (name: string): ReactNode => {
  const ctx = useContext(PortalCtx);
  const [content, setContent] = useState<ReactNode>();
  useLayoutEffect(
    () => ctx.get(name).targets.store(setContent),
    [ctx, name, setContent],
  );
  return content;
};

const PortalSource: FunctionComponent<{
  name: string;
  children?: ReactNode;
}> = ({ name, children }) => {
  usePortalSource(name, children);
  return null;
};

const PortalTarget: FunctionComponent<{ name: string }> = ({ name }) =>
  createElement(Fragment, {}, usePortalTarget(name));

export {
  PortalContext,
  PortalSource,
  PortalTarget,
  usePortalSource,
  usePortalTarget,
};
