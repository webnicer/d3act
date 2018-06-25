const d3 = require('d3');
const { JSDOM } = require('jsdom');

function render(element, parent) {
  if (typeof element === 'function') {
    return element(parent);
  }

  const { component, props, children } = element;
  const rendered = component(parent, props, children);

  if (rendered.d3act) {
    return render(rendered, parent);
  }

  if (rendered instanceof d3.selection) {
    children.forEach((child) => render(child, rendered));

    return rendered;
  }

  return parent;
}

function serverRender(element) {
  const {
    window: { document }
  } = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html');
  const container = d3.select(document.body);

  render(element, container);
  return container.html();
}

function createElement(component, props, ...children) {
  return {
    d3act: true,
    component,
    props,
    children
  };
}

function append(parent, data, tag, selector = tag) {
  const selection = parent.selectAll(selector).data(data);

  selection.exit().remove();

  return selection
    .enter()
    .append(tag)
    .merge(selection);
}

function appendOne(parent, tag, selector = tag) {
  return append(parent, [true], tag, selector);
}

module.exports = {
  render,
  serverRender,
  createElement,
  append,
  appendOne
};
