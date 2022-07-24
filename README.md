# React Portal Target

Like [React Portal](https://reactjs.org/docs/portals.html), but the target is
another location in the React component tree (or a hook) instead of targeting
a DOM node.

```shell
npm install --save react-portal-target
```

## Example

### Components

```jsx
const MyHeader = () => (
  <header>Welcome. <PortalTarget name="mytarget" /></header>
);

const MyPage = () => (
  <main>
    This is a page
    <PortalSource name="mytarget">You're looking at page <strong>one</strong></PortalSource>
  </main>
);

ReactDOM.render((
  <PortalContext>
    <MyHeader />
    <MyPage />
  </PortalContext>
), document.body);
```

Renders as:

```html
<header>Welcome. You're looking at page <strong>one</strong></header>
<main>This is a page</main>
```

### Hooks

Note that the components API simply wraps the hooks, and is recommended in most
cases. But if you need to be able to perform additional processing, you can use
the hooks directly (it is also possible to mix-and-match the hooks and
components APIs, for example using a hook target and a component source).

```jsx
const MyHeader = () => {
  const content = usePortalTarget('mytarget');
  if (!content) {
    return (<header>No page active!</header>);
  }
  return (<header>Welcome. {content}</header>);
};

const MyPage = () => {
  usePortalSource('mytarget', <>You're looking at page <strong>one</strong></>);
  return (<main>This is a page</main>);
};

ReactDOM.render((
  <PortalContext>
    <MyHeader />
    <MyPage />
  </PortalContext>
), document.body);
```

Renders as:

```html
<header>Welcome. You're looking at page <strong>one</strong></header>
<main>This is a page</main>
```

## API

### `<PortalContext>...</PortalContext>`

Provides the context for passing data between components. If not used, a global
context is used by default.


### `<PortalTarget name="my-target-name" />`

Defines an outlet for displaying content. See also `usePortalTarget`.

The content will be wrapped in a React Fragment.

If multiple targets are defined with the same name, the content will only be
shown in the first target to render (once that target unmounts, it will move to
the second, and so on.)


### `content = usePortalTarget(name)`

Defines an outlet for displaying content, returning the current content.

The content is returned exactly as it was provided, with no processing or
wrapping.


### `<PortalSource name="my-target-name">content</PortalSource>`

Defines an inlet for providing content. See also `usePortalSource`.

If multiple sources are defined for the same target, only one will be displayed
at a time (the first to render, though this may not always be the first on the
page).


### `usePortalSource(name, content)`

Defines an inlet for providing content. The content should be one of:

* a string,
* an element,
* null
* an array of the above

The recommended way to provide multi-element content is to wrap it in a fragment:

```jsx
usePortalSource('my-thing', <>foo<strong>bar</strong></>);
```

but it is also possible to provide it as an array:

```jsx
usePortalSource('my-thing', ['foo', <strong>bar</strong>]);
```

## Caveats

Because this internally relies on `useLayoutEffect`, it will not render as part
of server-side-rendering (the portaled content will be unavailable until the
tree is hydrated on the client). If server-side-rendering is important to you,
you will need to re-structure your page to put the portaled content directly
inside the target element.
