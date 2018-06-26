import d3 from 'd3';

function render(element, parent) {
  if (typeof element === 'function') {
    return element(parent);
  }

  const { component, props, children } = element;
  const rendered = component(parent, props, children);

  if (rendered.d3actor) {
    return render(rendered, parent);
  }

  if (rendered instanceof d3.selection) {
    children.forEach((child) => render(child, rendered));

    return rendered;
  }

  return parent;
}

function createElement(component, props, ...children) {
  return {
    d3actor: true,
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

export { render, createElement, append, appendOne };
