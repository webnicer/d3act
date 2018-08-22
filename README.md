# d3actor

[![Build Status](https://travis-ci.org/webnicer/d3actor.svg?branch=master)](https://travis-ci.org/webnicer/d3actor)
[![Dependency Status](https://david-dm.org/webnicer/d3actor/status.svg)](https://david-dm.org/webnicer/d3actor)
[![codecov](https://codecov.io/gh/webnicer/d3actor/branch/master/graph/badge.svg)](https://codecov.io/gh/webnicer/d3actor)

[d3actor](https://github.com/webnicer/d3actor/) (pronounced 'dee-actor') is a very simple and lightweight library, which supports creating truly reusable and self-contained [d3](https://github.com/d3/d3) components. d3actor's API is inspired by React.

## Highlights
Here are a few important highlights to get you excited:

* d3actor has no external dependencies, other than peer d3. It won't bloat your codebase when you add it to your project.
* d3actor's API is very simple and therefore easy to learn. It should take you best part of 5 minutes to become a master.
* d3actor does not force you to use d3 in any certain way. Rather, it helps to organise your code in a more structured and clearer fashion.
* d3actor will help you to divide and conquer - create independent, reusable components, and compose them easily.
* You can have children with d3actor!

## Rationale
Taking first steps with d3 is usually a walk in the park. You select a DOM element, add some attributes to it, maybe attach a few children, job's a good'un. However, while you continue your journey, you find yourself needing more selections, data bindings, scales, axis and so forth, and before you know it, you have a few hundred lines of code, plenty of variables, everything living in one scope, nothing particularly reusable (other than copy and paste) nor easy to understand.

d3actor is an attempt to eliminate the spaghetti pain point by encouriging battle-tested approach of creating reusable components. d3actor heeds the following principles:

* Component is simply a function with a well-defined signature.
* Components can be easily composed into rendering trees.
* Composition has to allow for passing props and children to components during the rendering process.
 
I would like to highlight the third point here, because it talks of something very important - children. The component does not have to know upfront what its children are, they get added during the rendering and that's one of the keys to reusability.

## Installation
d3actor requires d3 as a peer dependency:

```bash
$ npm install d3actor d3
```

d3actor is also built as an UMD, so if you want to use it directly in your browser, you can do so. In this case d3actor will be exposed as a global variable and it will expect d3 to be exposed as such as well:

```html
<!-- Somewhere in your markup -->
<script src="https://unpkg.com/d3"></script>
<script src="https://unpkg.com/d3actor"></script>
<script>
  // Your lovely code.
</script>
```

## Quick Start
d3actor is built as a CommonJS, ES6 and UMD module. The examples below will show you how to create and render simple d3actor component with each of those builds.

### ES6
In this example we assume that the DOM tree contains an element with `id="container"` and the app will operate in the browser environment.

```js
import * as d3 from 'd3';
import { render, createElement } from 'd3actor';

function Svg(parent, { width, height }) {
  return parent
    .append('svg')
    .attr('width', width)
    .attr('height', height);
}

const container = d3.select('#container');

render(
  createElement(Svg, { width: 320, height: 200 }),
  container
);
```

The result will look like this:

```html
<div id="container">
  <svg width="320" height="200"></svg>
</div>
```

### CommonJS
In this example we assume that we are performing server side rendering, so the DOM needs to be faked, for example by `jsdom`.

```js
const d3 = require('d3');
const { render, createElement } = require('d3actor');
const { JSDOM } = require('jsdom');

function Svg(parent, { width, height }) {
  return parent
    .append('svg')
    .attr('width', width)
    .attr('height', height);
}

const {
  window: { document }
} = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
const container = d3.select(document.body);

render(
  createElement(Svg, { width: 320, height: 200 }),
  container
);

// The resulting HTML can be easily retrieved.
const html = container.html();
```

The `html` variable will contain the following string:
```
<svg width="320" height="200"></svg>
```

### UMD
In this example we assume that we simply want to mock about in jsbin or in Codepen, and we don't care much about the build process.

```html
<!-- Somewhere in your markup -->
<script src="https://unpkg.com/d3"></script>
<script src="https://unpkg.com/d3actor"></script>
<script>
  (function app() {
    function Svg(parent, props) {
      return parent
        .append('svg')
        .attr('width', props.width)
        .attr('height', props.height);
    }

    const container = d3.select('#container');

    d3actor.render(
      d3actor.createElement(Svg, { width: 320, height: 200 }),
      container
    );
  })();
</script>
```

The result will look like this:

```html
<div id="container">
  <svg width="320" height="200"></svg>
</div>
```

## Tutorial
d3actor offers a simple way of creating reusable d3 components, which can be easily composed into a rendering tree. Each component is a function accepting three arguments: `parent`, `props` and `children`. Those arguments are passed to the component during the rendering. That in turn means the component doesn't know its `parent`, `props` nor `children` upfront. It is meant to be an independent entity, which is not coupled with the application and can be reused. This approach helps to organise the application logic into meaningful blocks, which are easier to reason about and move around if needed.

*Note:* In all of the examples below we assume the presence of a tag with `id="container"` somewhere in the markup:

```html
<div id="container"></div>
```

### Selection components
Selection components return a `d3.selection`. Let's have a look at an example component. The `Svg` component presented below takes two props (`width` and `height`) and returns the selection of the `svg` element appended to the provided `parent`.

```js
function Svg(parent, { width = 640, height = 480 }) {
  return parent
    .append('svg')
    .attr('width', width)
    .attr('height', height);
}
```

Rendering a component with default prop values is very straighforward. We need to call `render` function with two arguments - the component and the parent `d3.selection`:

```js
render(Svg, d3.select('#container'));
```

And here's the result, as we would expect:

```html
<div id="container">
  <svg width="640" height="480"></svg>
</div>
```

In the example above we didn't pass any props to the component and it rendered with default values. However, most of the time we would like to pass props and that's where elements come in handy. An element is simply an object wrapped around a component, props and children. An element can be passed to the `render` function instead of a component. The element object stucture is an implementation detail - what's important is that `createElement` function can create an element for us. `createElement` takes any number of arguments: the first is a component, the second is a props object and the rest are children. For now let's see how it works with just a component and props: 

```js
render(
  createElement(
    Svg,
    { widht: 320, height: 240 }
  ),
  d3.select('#container')
);
```

Now the result will be slightly different than before:

```html
<div id="container">
  <svg width="320" height="240"></svg>
</div>
```

As you can see, during the rendering the component received the props enclosed in the element. That's how props can be passed to a component in the rendering tree. A single element with no children, just like the one above, is simply a very short rendering tree. The real magic happens when we start adding branches (children) to the rendering tree.

Let's create another component, which will help us understand how to define children. The `Background` component shown below takes one prop (`color`) and returns the selection of the `rect` element appended to the provided `parent`.

```js
function Background(parent, { color = 'white' }) {
  return parent
    .append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', color);
}
```

Now, let's compose our two components in a rendering tree, making `Background` a child of `Svg`:

```js
render(
  createElement(
    Svg,
    { width: 320, height: 200 },
    Background
  ),
  d3.select('#container')
);
```

The result would be as follows:

```html
<div id="container">
  <svg width="320" height="200">
    <rect width="100%" height="100%" fill="white"></rect>
  </svg>
</div>
```

As we said before, `Background`, attaches `rect` to the provided parent. In this case, `rect` was attached to `svg`, which was enclosed in the selection returned from our `Svg` component. That makes sense - we wanted `Background` to be a child of `Svg`.

It's important to note here, that any child defined in an element can be either a component or an element:

```js
render(
  createElement(
    Svg,
    { width: 320, height: 200 },
    createElement(
      Background,
      { color: 'pink' }
    )
  ),
  d3.select('#container')
);
```

The result would be as follows:

```html
<div id="container">
  <svg width="320" height="200">
    <rect width="100%" height="100%" fill="pink"></rect>
  </svg>
</div>
```

Again, the props enclosed in the element wrapped around `Background` were passed to the `Background` component during rendering.

There is no limit on the number of children that can be defined in an element, nor on the depth of the rendering tree. Let's now create one more component, and have a look at an example with multiple children and grandchildren.

The `SvgElement` component is slightly more interesting. It allows to render any svg element. It recognises two props (`tagName` and `text`). Any other prop passed to it would be treated as an attribute of the created svg element. Once again, the component returns the selection of the created svg element, appended to the provided `parent`.

```js
function SvgElement(parent, props) {
  const { tagName, text } = props;
  const selection = parent.append(tagName);

  Object.entries(props)
    .forEach(([attribute, value]) => {
      if (attribute !== 'tagName' && attribute !== 'text') {
        selection.attr(attribute, value);
      }
    })

  if (text) {
    selection.text(text);
  }

  return selection;
}
```

Now we're ready to create and render a tree with children and grandchildren:

```js
render(
  createElement(
    Svg,
    { width, height },
    createElement(
      SvgElement,
      { tagName: 'g', id: 'background' },
      Background
    ),
    createElement(
      SvgElement,
      { tagName: 'g', id: 'main' },
      createElement(
        SvgElement,
        { tagName: 'text', x: 100, y: 100, fill: 'black', text: 'What actor? d3actor!' }
      )
    )
  ),
  d3.select('#container')
);
```

The result would be as follows:

```html
<div id="container">
  <svg width="640" height="480">
    <g id="background">
      <rect width="100%" height="100%" fill="white"></rect>
    </g>
    <g id="main">
      <text x="100" y="100" fill="black">What actor? d3actor</text>
    </g>
  </svg>
</div>
```

As we can see, `svg` has got two children and two grandchildren. The rendering tree could go much deeper if we wanted to. In fact, in real-life examples it most certainly would.

All of the selection components we've seen so far are reusable (even if somewhat primitive) and we could easily compose them. Each of them would return a `d3.selection`, which would be passed to its children as a parent.

Selection components are the core - they implement actual d3 manipulations. However, they don't offer a solution for creating bigger blocks of functionality through composing other components. This task is left to the second type of components called "composition components".

### Composition components
Composition components return an element instead of a selection. They are also functions, they also take `parent`, `props` and `children` as arguments, however they represent reusable part of the rendering tree, which can be paremetrised and moved around easily. Let's create a composition component then.

The `Chart` component takes two props (`width` and `height`) and returns an element wrapped around the root component `Svg` with two children: group `g#background` containing the background and group `g#main` containing children passed to the component:

```js
function Chart(parent, { width, height }, children) {
  return createElement(
    Svg,
    { width, height },
    createElement(
      SvgElement,
      { tageName: 'g', id: 'background' },
      createElement(Background, { color: 'blue' })
    ),
    createElement(
      SvgElement,
      { tagName: 'g', id: 'main' },
      ...children
    )
  );
}
```

The rendering tree returned by the component is not too dissimilar to the rendering tree we have created in the previous example. The main difference is, that now the part of the tree is generated by the component and not defined at the point of calling the `render` function. Let's render the component.

```js
render(
  Chart,
  d3.select('#container')
);
```

The result would be as follows:

```html
<div id="container">
  <svg width="640" height="480">
    <g id="background">
      <rect width="100%" height="100%" fill="blue"></rect>
    </g>
    <g id="main"></g>
  </svg>
</div>
```

As we said before, `render` can take an element instead of a component as the first argument. This holds true regardless of the type of component which is wrapped in the element:

```js
render(
  createElement(
    Chart,
    { width: 320, height: 240 },
    createElement(
      SvgElement,
      { tagName: 'text', x: 100, y: 100, fill: 'white', text: 'hello world' }
    )
  ),
  d3.select('#container')
);
```

Here's the result:

```html
<div id="container">
  <svg width="320" height="240">
    <g id="background">
      <rect width="100%" height="100%" fill="blue"></rect>
    </g>
    <g id="main">
      <text x="100" y="100" fill="white">hello world</text>
    </g>
  </svg>
</div>
```

As we would have expected, the props enclosed in the element were passed to the `Chart` component, which in turn passed them on to the `Svg` component. Another thing worth noting here is the postion of the child defined in the element. It appeared inside the group `g#main` - exactly as was prescribed by the component.

Handling children is the second difference between selection and composition components. The former have their children simply attached to the returned selection and they usually don't need to handle their children directly. The latter on the other hand, have to specify where the children are going to be placed. This is because, as we can see in this example, a composition component can create a deep rendering tree and choose to place the children anywhere within it.

In some cases, there might be a need to create a composition component with a very simple root component, which does not exist. Creating such a simple root component could be an overkill, therefore a composition component can also compose a `d3.selection` with children. Let's see an example.

The `GroupWithBackground` component takes one prop (`id`) and returns an element which composes (appended to the provided parent) group `g#${id}` with `Background` and provided children.

```js
function GroupWithBackground(parent, { id = 'group' }, children) {
  const selection = parent
    .append('g')
    .attr('id', id);

  return createElement(
    selection,
    null,
    Background,
    ...children
  )
}
```

Let's render:

```js
render(
  createElement(
    Svg,
    null,
    createElement(
      GroupWithBackground,
      { id: 'main' },
      createElement(
        SvgElement,
        { tagName: 'text', x: 100, y: 100, fill: 'white', text: 'hello world' }
      )
    )
  ),
  d3.select('#container')
);
```

And here's the result:

```html
<div id="container">
  <svg width="640" height="480">
    <g id="main">
      <rect width="100%" height="100%" fill="white"></rect>
      <text x="100" y="100" fill="white">hello world</text>
    </g>
  </svg>
</div>
```

One thing worth noting here, is how we passed `null` instead of props to the `Svg` component. This is an equivalent of passing an empty props object or not passing props at all, therefore forcing the component to use default props values.

### Re-rendering
We have seen quite a few examples of rendering and a careful reader would probably ask a question: "what about re-rendering?". In many real-life applications there would be a need for re-rendering, e.g. some props change, application needs to react to user interaction, etc. What would happen if we re-rendered one of the components? Let's see:

```js
render(Svg, d3.select('#container'));
render(Svg, d3.select('#container'));
```

The above would produce:

```html
<div id="container">
  <svg width="640" height="480"></svg>
  <svg width="640" height="480"></svg>
</div>
```

That's probably not what we want. We would presumably like the `svg` element to be created once and then to be updated during subsequent rendering. There are a couple of few ways of dealing with it. Let's see how we could use native d3 mechanisms in the component to ensure that there is always only one `svg` element within the container.

```js
function SvgOne(parent, { width = 640, height = 480 }) {
  const selection = parent.selectAll('svg').data([true]);

  selection.exit().remove();

  return selection.enter()
    .append('svg')
    .merge(selection)
    .attr('width', width)
    .attr('height', height);
}
```

The `selection` variable contains the update selection - all `svg` elements bound to an array containing one element. We want to make sure there is no more than one `svg` element, so we remove excess elements using the exit selection. We also want to make sure that the `svg` element is added if there was none, so we the use enter selection. At this point, no matter how many `svg` elements there were to start with, we will have just one `svg` element between the update and the enter selections. Therefore we can merge those two selections and perform required transformations.

Let's render the component twice and see what happens:

```js
render(SvgOne, d3.select('#container'));
render(
  createElement(
    SvgOne,
    { width: 320 }
  ),
  d3.select('#container')
);
```

Here's the result:

```html
<div id="container">
  <svg width="320" height="480"></svg>
</div>
```

The component was rendered twice, but the `svg` element was created once and then updated. Exactly what we wanted. The re-rendering pattern from `SvgOne` is required so often that d3actor has an utility function for it, called `appendOne`. The following implementation is an equivalent of `SvgOne`:

```js
import { appendOne } from 'd3actor';

function SvgOneMore(parent, { width = 640, height = 480 }) {
  return appendOne(parent, 'svg')
    .attr('width', width)
    .attr('height', height);
}
```

Let's render this component twice and see what happens:

```js
render(SvgOneMore, d3.select('#container'));
render(
  createElement(
    SvgOneMore,
    { width: 320 }
  ),
  d3.select('#container')
);
```

Here's the result:

```html
<div id="container">
  <svg width="320" height="480"></svg>
</div>
```

As you can see, the result of rendering `SvgOneMore` twice is exactly the same as that of rendering `SvgOne` twice. The only difference being we reduced the boilerplate in the component.

Of course you won't always rely on just the tag name to ensure that an element is created only once. That could be quite limiting. That's why `appendOne` takes one more parameter - `selector`, which allows to specify which pre-existing elements are going to be included in the selection. Let's create `BackgroundOne` and see how this works.

```js
function BackgroundOne(parent, { color = 'white', id = 'background' }) {
  return appendOne(parent, 'rect', `rect#${id}`)
    .attr('id', id)
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', color);
}
```

Rendering the above component more then once will also result in one element, updated on each subsequent rendering.

```js
render(
  createElement(
    SvgOneMore,
    null,
    BackgroundOne
  ),
  d3.select('#container')
);
render(
  createElement(
    SvgOneMore,
    null,
    createElement(BackgroundOne, { color: 'pink '})
  ),
  d3.select('#container')
);
```

The result will be as follows:

```html
<div id="container">
  <svg width="640" height="480">
    <rect width="100%" height="100%" fill="pink"></rect>
  </svg>
</div>
```

It's worth pointing out here, that `appendOne` calls `.remove()` on the exit selection, therefore making sure that if there is more then one pre-existing element matching the selector, only one will remain.

### Data binding

d3 revolves around data binding, so it's quite important to have a look at some examples of how we can do that with d3actor. In essense, it's no different to using raw d3 - all the components do is they encapsulate d3 code after all. Let's create a component which binds some data.

The `Bars` component takes 6 props:
* `data` - the data to be plotted as bars; it's expected to be an array of objects with two props each - `mtstamp` and `value`
* `x` - the x-scale
* `y` - the y-scale; it's expected to be inverted
* `barWidth` - the width of each bar
* `maxHeight` - maximum height of a bar
* `color` - color of the bars

```js
function Bars(
  parent,
  { data, x, y, barWidth, maxHeight, color = 'steelblue' }
) {
  const selection = parent.selectAll('rect').data(data);

  selection.exit().remove();

  selection
    .enter()
    .append('rect')
    .merge(selection)
    .style('fill', color)
    .attr('x', (d) => x(d.mtstamp))
    .attr('width', barWidth)
    .attr('y', (d) => y(d.value))
    .attr('height', (d) => maxHeight - y(d.value));
}
```

The `Bars` component is pretty primitive, however it does the job. It uses the same pattern as `SvgOne` (see "Re-rendering" section) for ensuring that only `rect` elements which represent data will be present in the markup. It's worth noting, that this component does not return anything - this way we can guard against attaching children to the component.

For completeness, let's create a composition component, which prepares the scales and wraps `Bars` in an `svg` element.

```js
function BarChart(parent, { data, width = 640, height = 480, Component }) {
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.mtstamp))
    .paddingInner(0.1)
    .rangeRound([0, width]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .rangeRound([height, 0]);

  return createElement(
    Svg,
    { width, height },
    createElement(Component, {
      data,
      x,
      y,
      barWidth: x.bandwidth,
      maxHeight: height
    })
  );
}
```

Now let's render the `BarChart` with some real data, for example total number of monthly contributions on Hacker News between January and May 2018.

```js
render(
  createElement(BarChart, {
    data: [
      { mtstamp: 1514764800000, value: 234992 },
      { mtstamp: 1517443200000, value: 209738 },
      { mtstamp: 1519862400000, value: 237342 },
      { mtstamp: 1522540800000, value: 237605 },
      { mtstamp: 1525132800000, value: 237647 }
    ],
    Component: Bars
  }),
  container
);
```

And here's the result:

```html
<div id="container">
  <svg width="640" height="480">
    <rect style="fill: steelblue;" x="2" width="117" y="5" height="475"/>
    <rect style="fill: steelblue;" x="132" width="117" y="56" height="424"/>
    <rect style="fill: steelblue;" x="262" width="117" y="1" height="479"/>
    <rect style="fill: steelblue;" x="392" width="117" y="0" height="480"/>
    <rect style="fill: steelblue;" x="522" width="117" y="0" height="480"/>
  </svg>
</div>
```

In fact, the update / exit / enter pattern is so common, that d3actor provides utility function for it, called `append`. The following implementation is an equivalent of `Bars`:

```js
import { append } from 'd3actor';

function BarsOne(
  parent,
  { data, x, y, barWidth, maxHeight, color = 'steelblue' }
) {
  append(parent, data, 'rect')
    .style('fill', color)
    .attr('x', (d) => x(d.mtstamp))
    .attr('width', barWidth)
    .attr('y', (d) => y(d.value))
    .attr('height', (d) => maxHeight - y(d.value));
}
```

Let's render:

```js
render(
  createElement(BarChart, {
    data: [
      { mtstamp: 1514764800000, value: 234992 },
      { mtstamp: 1517443200000, value: 209738 },
      { mtstamp: 1519862400000, value: 237342 },
      { mtstamp: 1522540800000, value: 237605 },
      { mtstamp: 1525132800000, value: 237647 }
    ],
    Component: BarsOne
  }),
  container
);
```

And the result is identical:

```html
<div id="container">
  <svg width="640" height="480">
    <rect style="fill: steelblue;" x="2" width="117" y="5" height="475"/>
    <rect style="fill: steelblue;" x="132" width="117" y="56" height="424"/>
    <rect style="fill: steelblue;" x="262" width="117" y="1" height="479"/>
    <rect style="fill: steelblue;" x="392" width="117" y="0" height="480"/>
    <rect style="fill: steelblue;" x="522" width="117" y="0" height="480"/>
  </svg>
</div>
```

Similarly to `appendOne`, `append` accepts one more parameter `selector`, which allows to specify which pre-existing elements are going to be included in the selection. I spare the reader verbose examples here.

## API

### render
The `render` function renders specified component or element with provided `d3.selection` parent.

*Example: rendering a component*
```js
render(Svg, d3.select('#container'));
```

*Example: rendering an element*
```js
render(
  createElement(
    Svg,
    { width: 320, height: 240 }
  ),
  d3.select('#container')
);
```

**Syntax**

`render(componentOrElement, parent)`

**Arguments**

* `componentOrElement`: required; a component function or an element.
* `parent`: required; `d3.selection`, which is used as a parent for the specified component or element.

**Returns**

`d3.selection` which is a result of rendering the component or element. Alternatively, it returns provided `parent` if rendering the component or element did not result in `d3.selection`.

**Description**

The `render` function traverses recursively the rendering tree created with elements, applying d3 transformations prescribed by the components.

When the `render` function is provided with a component it runs this component with specified `parent`, `{}` for props and `[]` for children. If the component returns a `d3.selection`, that selection is then returned by `render` and the rendering process is finished. If the component is a composition component and returns an element, then `render` calls itself with the element and provided `parent` and then returns whatever the self-call returned.

When the `render` function is provided with an element, it first unwraps the element getting the component (or selection), props and children. Then, if the element was wrapped around `d3.selection`, `render` calls itself for each child in turn, using the selection as a parent and finally returns the selection.

If the element was wrapped around a component, `render` calls the component with provided `parent` and props and children unwrapped from the element.

If the component returned `d3.selection`, it calls itself for each child in turn, using the returned selection as a parent and then returns the selection.
If the component returned an element, it calls itself with that element and provided `parent` and then returns whatever the self-call returned.

The recurisive nature of `render` allows rendering trees of any depth, with any combination of children - components, elements wrapped around a component or elements wrapped around a `d3.selection`.

### createElement
The `createElement` function creates an element wrapper around a component (or a `d3.selection`) with props and children.

*Example: creating an element*
```js
createElement(
  Svg,
  { width: 320, height: 240 },
  Background,
  createElement(SvgElement, { tagName: 'g' })
);
```

**Syntax**

`createElement(componentOrSelection[, props[, child1[, child2[, ...]]]])`

**Arguments**:

* `componentOrSelection`: required; a component or a `d3.selection`.
* `props`: optional; an object with arbitrary properties expected by the component.
* `child1, child2, ...`: optional; a components or elements. The component always receives an array of children. If no children were specified.

**Returns**:

Simple object wrapper around a component (or `d3.selection`), props and children.

**Description**

The `createElement` function wrappes an object around provided arguments, taking care of the edge cases, so that components can be kept simple and don't need to repeat the same sanity checks over and over again.

If the `props` argument is `undefined` or `null` an empty object (`{}`) will be used for props instead. That way components can always assume that they will receive an object for props.

No matter how many children are defined, they will be always gathered in an array. If there are no children defined, an empty array will be used. That way components can always assume that they will receive an array for children.

### append
The `append` function appends svg elements bound with provided data to the given parent. Re-rendering safe.

**Syntax**

`append(parent, data, tag[, selector])`

**Arguments**

* `parent`: required; parent `d3.selection`.
* `data`: required; data, which is going to be bound to the elements selected by `selection`.
* `tag`: required; the tag which will be used for appending elements in the enter selection.
* `selector`: optional; the default value is the same as `tag`. Used to create the update and exit selections within given parent.

**Returns**

`d3.selection`, which is the result of merging update and enter selection.

**Description**

The `append` function is a convenience function, which implements popular update / exit / enter pattern, thus helping to reduce boilereplate. The implementation is very simple:

```js
function append(parent, data, tag, selector = tag) {
  const selection = parent.selectAll(selector).data(data);

  selection.exit().remove();

  return selection
    .enter()
    .append(tag)
    .merge(selection);
}
```

The function first selects all the children of the given parent, which are specified by `selector`. By default `selector` takes the value of the `tag` parameter. The selection is then bound to the provided data, creating update selection. The next step is to remove redundant elements on the exit selection, then append elements with the given tag on the enter selection, and finally return merged update and enter selections.

The function requires the `tag` and the `selector` to be in sync. Also, whatever attributes are used in the selector, should be set manually. For example, if targeting `<rect class="bar"></rect>`, we need to ensure the tag to be `rect` and set the class manually:

```js
append(parent, data, 'rect', 'rect.bar')
  .attr('class', 'bar');
```

### appendOne
The `appendOne` function ensures there is exactly one svg specified element appended to the provided parent. Re-rendering safe.

**Syntax**

`appendOne(parent, tag[, selector])`

**Arguments**

* `parent`: required; parent `d3.selection`.
* `tag`: required; the tag of the appended element.
* `selector`: optional; the default value is the same as `tag`. Used to ensure that no elements 

**Description**

The `appendOne` function is a convenience function, which implements popular update / exit / enter pattern, ensuring that only one element specified by the `selector` or with a given `tag` exists as a child of the given parent.

The function requires the `tag` and the `selector` to be in sync. Also, whatever attributes are used in the selector, should be set manually. For example, if targeting `<rect class="bar"></rect>`, we need to ensure the tag to be `rect` and set the class manually:

```js
append(parent, 'rect', 'rect.foo')
  .attr('class', 'foo');
```
## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
