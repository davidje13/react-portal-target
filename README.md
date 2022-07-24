# React Portal Target

Allows React components to put content elsewhere on the page, for example pages
defining content to show in a shared header or footer.

Like [React Portal](https://reactjs.org/docs/portals.html), but the target is
another location in the React component tree (or a hook) instead of targeting
a DOM node.

## Example

```shell
npm install --save react-portal-target
```

### Components API

```jsx
const MyHeader = () => (
  <header>Welcome. <PortalTarget name="mytarget" /></header>
);

const MyPage = () => (
  <main>
    This is a page
    <PortalSource name="mytarget">
      You're looking at page <strong>one</strong>
    </PortalSource>
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

### Hooks API

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
  usePortalSource(
    'mytarget',
    <>You're looking at page <strong>one</strong></>
  );
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

### `<PortalContext>`

```xml
<PortalContext>...</PortalContext>
```

Provides the context for passing data between components. This should be high
up in your component tree so that it contains all sources and targets.

If not used, a global context is used by default.


### `<PortalTarget>`

```xml
<PortalTarget name="my-target-name" />
<PortalTarget name="my-target-name">default content</PortalTarget>
```

Defines an outlet for displaying content. You can optionally specify default
content to display when no sources are linked to the target.

The content will be wrapped in a React Fragment.

If multiple targets are defined with the same name, the content will only be
shown in the first target to render (once that target unmounts, it will move to
the second, and so on.)

See also [`usePortalTarget`](#useportaltarget).


### `usePortalTarget`

```jsx
content = usePortalTarget(name)
content = usePortalTarget(name, defaultContent)
```

Defines an outlet for displaying content, returning the current content. You
can optionally specify default content to return when no sources are linked to
the target.

The content is returned exactly as it was provided, with no processing or
wrapping.

See also [`PortalTarget`](#portaltarget).


### `<PortalSource>`

```xml
<PortalSource name="my-target-name">content</PortalSource>
```

Defines an inlet for providing content.

If multiple sources are defined for the same target, only one will be displayed
at a time (the first to render, though this may not always be the first on the
page).

See also [`usePortalSource`](#useportalsource).


### `usePortalSource`

```jsx
usePortalSource(name, content)
```

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

See also [`PortalSource`](#portalsource).


## Caveats

Because this internally relies on `useLayoutEffect`, it will not render as part
of server-side-rendering (the portaled content will be unavailable until the
tree is hydrated on the client). If server-side-rendering is important to you,
you will need to re-structure your page to put the portaled content directly
inside the target element.
