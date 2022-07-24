"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePortalTarget = exports.usePortalSource = exports.PortalTarget = exports.PortalSource = exports.PortalContext = void 0;
const react_1 = require("react");
class PrimaryTracker {
    constructor(onChange) {
        this.onChange = onChange;
        this.values = new Map();
        this.primaryId = null;
    }
    store(value) {
        const id = {};
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
class Portal {
    constructor(destructor) {
        this.destructor = destructor;
        this.update = () => {
            const target = this.targets.get();
            if (target) {
                target(this.sources.get());
            }
            else if (this.sources.isEmpty()) {
                this.destructor();
            }
        };
        this.sources = new PrimaryTracker(this.update);
        this.targets = new PrimaryTracker(this.update);
    }
}
class PortalMap {
    constructor() {
        this.portals = new Map();
    }
    get(name) {
        let portal = this.portals.get(name);
        if (!portal) {
            portal = new Portal(() => this.portals.delete(name));
            this.portals.set(name, portal);
        }
        return portal;
    }
}
const PortalCtx = (0, react_1.createContext)(new PortalMap());
const PortalContext = ({ children, }) => {
    const [map] = (0, react_1.useState)(() => new PortalMap());
    return (0, react_1.createElement)(PortalCtx.Provider, { value: map }, children);
};
exports.PortalContext = PortalContext;
const usePortalSource = (name, content) => {
    const ctx = (0, react_1.useContext)(PortalCtx);
    (0, react_1.useLayoutEffect)(() => ctx.get(name).sources.store(content), [ctx, name, content]);
};
exports.usePortalSource = usePortalSource;
const usePortalTarget = (name, fallbackContent) => {
    const ctx = (0, react_1.useContext)(PortalCtx);
    const [content, setContent] = (0, react_1.useState)();
    (0, react_1.useLayoutEffect)(() => ctx.get(name).targets.store(setContent), [ctx, name, setContent]);
    return content === undefined ? fallbackContent : content;
};
exports.usePortalTarget = usePortalTarget;
const PortalSource = ({ name, children }) => {
    usePortalSource(name, children);
    return null;
};
exports.PortalSource = PortalSource;
const PortalTarget = ({ name, children }) => (0, react_1.createElement)(react_1.Fragment, {}, usePortalTarget(name, children));
exports.PortalTarget = PortalTarget;
