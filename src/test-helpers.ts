import 'lean-test';
import React from 'react';
import TestRenderer, {
  ReactTestRenderer,
  ReactTestRendererJSON,
} from 'react-test-renderer';
import { usePortalSource, usePortalTarget } from './index';

type Structure = React.ReactNode | ReactTestRenderer | unknown[];

export function makeTestTarget(defaultName: string) {
  const captured: React.ReactNode[] = [];
  const TestTarget: React.FunctionComponent<{}> = () => {
    const [name, setName] = React.useState(defaultName);
    captured.push(usePortalTarget(name));
    return React.createElement('div', { setName }, ['target']);
  };
  return Object.assign(TestTarget, {
    captured,
    latest() {
      return captured[captured.length - 1];
    },
    access(rendered: ReactTestRenderer) {
      return rendered.root.findByType(TestTarget).findByType('div');
    },
  });
}

export function makeTestSource(
  defaultName: string,
  defaultContent: React.ReactNode = null,
) {
  const TestSource: React.FunctionComponent<{}> = () => {
    const [name, setName] = React.useState(defaultName);
    const [content, setContent] = React.useState(defaultContent);
    usePortalSource(name, content);
    return React.createElement('div', { setName, setContent }, ['source']);
  };
  return Object.assign(TestSource, {
    access(rendered: ReactTestRenderer) {
      return rendered.root.findByType(TestSource).findByType('div');
    },
  });
}

export const matchesStructure = (expected: Structure) => (actual: Structure) =>
  equals(getStructure(expected))(getStructure(actual));

function getStructure(element: Structure): ReactTestRendererJSON[] {
  if (!element) {
    return [];
  }
  if (Array.isArray(element)) {
    return element as ReactTestRendererJSON[];
  }
  const rendered = isReactTestRenderer(element)
    ? element
    : TestRenderer.create(React.createElement(React.Fragment, {}, element));
  const r = rendered.toJSON();
  if (Array.isArray(r)) {
    return r;
  } else if (r === null) {
    return [];
  } else {
    return [r];
  }
}

function isReactTestRenderer(x: unknown): x is ReactTestRenderer {
  return Boolean((x as any).toJSON);
}
