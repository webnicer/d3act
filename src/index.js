import * as d3 from 'd3';

function isSelection(maybeSelection) {
  return maybeSelection instanceof d3.selection;
}

function isElement(maybeElement) {
  return (
    !!maybeElement && typeof maybeElement === 'object' && maybeElement.d3actor
  );
}

function isComponent(maybeComponent) {
  return typeof maybeComponent === 'function';
}

function render(elementOrComponent, parent) {
  let rendered = null;

  if (isComponent(elementOrComponent)) {
    rendered = elementOrComponent(parent, {}, []);

    if (isSelection(rendered)) {
      return rendered;
    }
  }

  if (isElement(elementOrComponent)) {
    const { component, props, children } = elementOrComponent;

    rendered = isSelection(component)
      ? component
      : component(parent, props, children);

    if (isSelection(rendered)) {
      children.forEach((child) => render(child, rendered));

      return rendered;
    }
  }

  if (isElement(rendered)) {
    return render(rendered, parent);
  }

  return parent;
}

function createElement(component, props, ...children) {
  return {
    d3actor: true,
    component,
    props: props || {},
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
