import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { PortalContext, PortalSource, PortalTarget } from './index';
import {
  makeTestSource,
  makeTestTarget,
  matchesStructure,
} from './test-helpers';

describe('moving content', () => {
  it('allows sources to be defined before targets', () => {
    const input = (
      <PortalContext>
        <main>
          Body
          <PortalSource name="foo">
            extra <em>content</em>
          </PortalSource>
        </main>
        <footer>
          Footer <PortalTarget name="foo" />
        </footer>
      </PortalContext>
    );

    const expected = (
      <>
        <main>Body</main>
        <footer>
          Footer {'extra '}
          <em>content</em>
        </footer>
      </>
    );

    expect(input, matchesStructure(expected));
  });

  it('allows targets to be defined before sources', () => {
    const input = (
      <PortalContext>
        <header>
          Header <PortalTarget name="foo" />
        </header>
        <main>
          Body
          <PortalSource name="foo">
            extra <em>content</em>
          </PortalSource>
        </main>
      </PortalContext>
    );

    const expected = (
      <>
        <header>
          Header {'extra '}
          <em>content</em>
        </header>
        <main>Body</main>
      </>
    );

    expect(input, matchesStructure(expected));
  });

  it('supports multiple portals simultaneously', () => {
    const input = (
      <PortalContext>
        <header>
          Header <PortalTarget name="top" />
        </header>
        <main>
          Body
          <PortalSource name="top">
            <em>one</em>
          </PortalSource>
          <PortalSource name="bottom">
            <em>two</em>
          </PortalSource>
        </main>
        <footer>
          Footer <PortalTarget name="bottom" />
        </footer>
      </PortalContext>
    );

    const expected = (
      <>
        <header>
          Header <em>one</em>
        </header>
        <main>Body</main>
        <footer>
          Footer <em>two</em>
        </footer>
      </>
    );

    expect(input, matchesStructure(expected));
  });

  it('renders only in the first target if multiple are defined', () => {
    const input = (
      <PortalContext>
        A<PortalTarget name="foo" />
        B<PortalTarget name="foo" />C
        <PortalSource name="foo">content</PortalSource>D
      </PortalContext>
    );

    expect(input, matchesStructure(['A', 'content', 'B', 'C', 'D']));
  });

  it('renders only the first source if multiple are defined', () => {
    const input = (
      <PortalContext>
        A<PortalTarget name="foo" />B
        <PortalSource name="foo">content1</PortalSource>C
        <PortalSource name="foo">content2</PortalSource>D
      </PortalContext>
    );

    expect(input, matchesStructure(['A', 'content1', 'B', 'C', 'D']));
  });
});

describe('react-portal-target hooks', () => {
  it('transfers content', () => {
    const MySource = makeTestSource(
      'test-hook',
      <>
        extra <em>content</em>
      </>,
    );
    const MyTarget = makeTestTarget('test-hook');

    TestRenderer.create(
      <PortalContext>
        <MyTarget />
        <MySource />
      </PortalContext>,
    );

    expect(
      MyTarget.latest(),
      matchesStructure(
        <>
          extra <em>content</em>
        </>,
      ),
    );
  });

  it('updates when content changes', () => {
    const MySource = makeTestSource('test-hook', <div>one</div>);
    const MyTarget = makeTestTarget('test-hook');

    const rendered = TestRenderer.create(
      <PortalContext>
        <MyTarget />
        <MySource />
      </PortalContext>,
    );
    act(() => MySource.access(rendered).props.setContent(<div>two</div>));

    expect(
      MyTarget.captured,
      isListOf(
        isUndefined(),
        matchesStructure(<div>one</div>),
        matchesStructure(<div>two</div>),
      ),
    );
  });

  it('does not update if content does not change', () => {
    const content = <div>one</div>;
    const MySource = makeTestSource('test-hook', content);
    const MyTarget = makeTestTarget('test-hook');

    const rendered = TestRenderer.create(
      <PortalContext>
        <MyTarget />
        <MySource />
      </PortalContext>,
    );
    act(() => MySource.access(rendered).props.setContent(content));

    expect(
      MyTarget.captured,
      isListOf(isUndefined(), matchesStructure(<div>one</div>)),
    );
  });

  it('moves to a new target if the source name changes', () => {
    const MySource = makeTestSource('t1', 'hello');
    const MyTarget1 = makeTestTarget('t1');
    const MyTarget2 = makeTestTarget('t2');

    const rendered = TestRenderer.create(
      <PortalContext>
        <MyTarget1 />
        <MyTarget2 />
        <MySource />
      </PortalContext>,
    );

    expect(MyTarget1.latest(), matchesStructure('hello'));
    expect(MyTarget2.latest(), isUndefined());

    act(() => MySource.access(rendered).props.setName('t2'));

    expect(MyTarget1.latest(), isUndefined());
    expect(MyTarget2.latest(), matchesStructure('hello'));
  });

  it('moves to the next target if multiple are defined and the first is removed', () => {
    const MySource = makeTestSource('t1', 'hello');
    const MyTarget1 = makeTestTarget('t1');
    const MyTarget2 = makeTestTarget('t1');

    const rendered = TestRenderer.create(
      <PortalContext>
        <MyTarget1 />
        <MyTarget2 />
        <MySource />
      </PortalContext>,
    );

    expect(MyTarget1.latest(), matchesStructure('hello'));
    expect(MyTarget2.latest(), isUndefined());

    act(() => MyTarget1.access(rendered).props.setName('t2'));

    expect(MyTarget1.latest(), isUndefined());
    expect(MyTarget2.latest(), matchesStructure('hello'));
  });

  it('moves to the next source if multiple are defined and the first is removed', () => {
    const MySource1 = makeTestSource('t1', 'hello');
    const MySource2 = makeTestSource('t1', 'hi');
    const MyTarget = makeTestTarget('t1');

    const rendered = TestRenderer.create(
      <PortalContext>
        <MyTarget />
        <MySource1 />
        <MySource2 />
      </PortalContext>,
    );

    expect(MyTarget.latest(), matchesStructure('hello'));

    act(() => MySource1.access(rendered).props.setName('t2'));

    expect(MyTarget.latest(), matchesStructure('hi'));
  });
});
