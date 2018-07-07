import * as d3 from 'd3';
import { createElement, render, appendOne, append } from './index';

function trim(xml) {
  return xml.replace(/\s*(?=<)|\s+$/g, '');
}

describe('d3actor', () => {
  describe('createElement()', () => {
    let component;
    let props;

    beforeEach(() => {
      component = (parent) => parent;
      props = { color: 'white' };
    });

    it('should return an object {d3actor: true, component, props, children}', () => {
      const child = component;
      const result = createElement(component, props, child);

      expect(result).toEqual({
        d3actor: true,
        component,
        props,
        children: [child]
      });
    });

    it('should give an empty array of children if no children specified', () => {
      const result = createElement(component, props);

      expect(result).toEqual({
        d3actor: true,
        component,
        props,
        children: []
      });
    });

    it('should give an empty object of props if no props specified', () => {
      const result = createElement(component);

      expect(result).toEqual({
        d3actor: true,
        component,
        props: {},
        children: []
      });
    });
  });

  describe('render()', () => {
    let container;
    let GroupSelection;
    let GroupHybrid;
    let GroupComposition;
    let SvgSelection;
    let SvgHybrid;
    let SvgComposition;

    beforeEach(() => {
      container = d3.select(document.body);
      container.html('');

      // Selection component.
      GroupSelection = jest.fn((parent, { id = 'selection' }) =>
        parent.append('g').attr('id', id)
      );

      // Hybrid component.
      GroupHybrid = jest.fn((parent, { id = 'hybrid' }, children) => {
        const selection = GroupSelection(parent, { id });

        return createElement(selection, null, ...children);
      });

      GroupComposition = jest.fn((parent, { id = 'composition' }, children) =>
        createElement(GroupSelection, { id }, ...children)
      );

      // Selection component.
      SvgSelection = jest.fn((parent, { width = 640, height = 480 }) =>
        parent
          .append('svg')
          .attr('width', width)
          .attr('height', height)
      );

      // Hybrid component.
      SvgHybrid = jest.fn((parent, { width, height }, children) => {
        const selection = SvgSelection(parent, { width, height });

        return createElement(selection, null, ...children);
      });

      // Composition component.
      SvgComposition = jest.fn((parent, { width, height }, children) =>
        createElement(SvgHybrid, { width, height }, ...children)
      );
    });

    describe('null component', () => {
      let Component;

      beforeEach(() => {
        Component = jest.fn().mockReturnValue(null);
      });

      it('should return the parent for the component', () => {
        const result = render(Component, container);

        expect(result).toEqual(container);
      });

      it('should return the parent for an element', () => {
        const result = render(createElement(Component), container);

        expect(result).toEqual(container);
      });

      it('should not render children', () => {
        render(createElement(Component, null, SvgSelection), container);

        expect(container.html()).toEqual('');
      });
    });

    // We have to use thunks for the components, because the components are initialiased
    // in `beforeEach` function and when `describe.each()` is run, all of them are still undefined.
    // Each thunk creates a closure on a component variable and when the variable finally
    // gets assigned a value before each test, it can be retrieved from the thunk.
    describe.each([
      ['selection component', () => SvgSelection],
      ['hybric component', () => SvgHybrid],
      ['composition component', () => SvgComposition]
    ])('%s', (name, componentThunk) => {
      it('should render the component', () => {
        render(componentThunk(), container);

        expect(componentThunk()).toHaveBeenCalledWith(container, {}, []);
        expect(container.html()).toEqual(
          '<svg width="640" height="480"></svg>'
        );
      });

      it('should render the element', () => {
        render(
          createElement(componentThunk(), { width: 100, height: 100 }),
          container
        );

        expect(container.html()).toEqual(
          '<svg width="100" height="100"></svg>'
        );
      });

      it('should render child components', () => {
        render(
          createElement(
            componentThunk(),
            null,
            GroupHybrid,
            GroupSelection,
            GroupComposition
          ),
          container
        );

        expect(container.html()).toEqual(
          trim(`
          <svg width="640" height="480">
            <g id="hybrid"></g>
            <g id="selection"></g>
            <g id="composition"></g>
          </svg>
        `)
        );
      });

      it('should render child elements', () => {
        render(
          createElement(
            componentThunk(),
            null,
            createElement(GroupSelection, { id: 'selection-element' }),
            createElement(GroupHybrid, { id: 'hybrid-element' }),
            createElement(GroupComposition, { id: 'composition-element' })
          ),
          container
        );

        expect(container.html()).toEqual(
          trim(`
          <svg width="640" height="480">
            <g id="selection-element"></g>
            <g id="hybrid-element"></g>
            <g id="composition-element"></g>
          </svg>
        `)
        );
      });

      it('should render grandchildren elements', () => {
        render(
          createElement(
            componentThunk(),
            null,
            createElement(
              GroupSelection,
              null,
              createElement(GroupSelection, { id: 'selection-selection' }),
              createElement(GroupHybrid, { id: 'selection-hybrid' }),
              createElement(GroupComposition, { id: 'selection-composition' })
            ),
            createElement(
              GroupHybrid,
              null,
              createElement(GroupSelection, { id: 'hybrid-selection' }),
              createElement(GroupHybrid, { id: 'hybrid-hybrid' }),
              createElement(GroupComposition, { id: 'hybrid-composition' })
            ),
            createElement(
              GroupComposition,
              null,
              createElement(GroupSelection, { id: 'composition-selection' }),
              createElement(GroupHybrid, { id: 'composition-hybrid' }),
              createElement(GroupComposition, {
                id: 'composition-composition'
              })
            )
          ),
          container
        );

        expect(container.html()).toEqual(
          trim(`
          <svg width="640" height="480">
            <g id="selection">
              <g id="selection-selection"></g>
              <g id="selection-hybrid"></g>
              <g id="selection-composition"></g>
            </g>
            <g id="hybrid">
              <g id="hybrid-selection"></g>
              <g id="hybrid-hybrid"></g>
              <g id="hybrid-composition"></g>
            </g>
            <g id="composition">
              <g id="composition-selection"></g>
              <g id="composition-hybrid"></g>
              <g id="composition-composition"></g>
            </g>
          </svg>
        `)
        );
      });

      it('should render grandchildren components', () => {
        render(
          createElement(
            componentThunk(),
            null,
            createElement(
              GroupSelection,
              null,
              GroupSelection,
              GroupHybrid,
              GroupComposition
            ),
            createElement(
              GroupHybrid,
              null,
              GroupSelection,
              GroupHybrid,
              GroupComposition
            ),
            createElement(
              GroupComposition,
              null,
              GroupSelection,
              GroupHybrid,
              GroupComposition
            )
          ),
          container
        );

        expect(container.html()).toEqual(
          trim(`
          <svg width="640" height="480">
            <g id="selection">
              <g id="selection"></g>
              <g id="hybrid"></g>
              <g id="composition"></g>
            </g>
            <g id="hybrid">
              <g id="selection"></g>
              <g id="hybrid"></g>
              <g id="composition"></g>
            </g>
            <g id="composition">
              <g id="selection"></g>
              <g id="hybrid"></g>
              <g id="composition"></g>
            </g>
          </svg>
        `)
        );
      });
    });

    describe('composition component', () => {
      it('should render nested composition', () => {
        const Composition1 = (parent, { width, height }, children) =>
          createElement(SvgComposition, { width, height }, ...children);
        const Composition2 = (parent, { width, height }, children) =>
          createElement(Composition1, { width, height }, ...children);
        const Composition3 = (parent, { width, height }, children) =>
          createElement(Composition2, { width, height }, ...children);

        render(
          createElement(
            Composition3,
            { width: 100, height: 100 },
            createElement(GroupComposition)
          ),
          container
        );

        expect(container.html()).toEqual(
          trim(`
          <svg width="100" height="100">
            <g id="composition"></g>
          </svg>
        `)
        );
      });
    });
  });

  describe('appendOne()', () => {
    let container;

    beforeEach(() => {
      container = d3.select(document.body);
      container.html('');
    });

    it('should do enter', () => {
      appendOne(container, 'svg')
        .attr('width', 100)
        .attr('height', 100);

      expect(container.html()).toEqual('<svg width="100" height="100"></svg>');
    });

    it('should do update', () => {
      container.append('svg');

      appendOne(container, 'svg')
        .attr('width', 100)
        .attr('height', 100);

      expect(container.html()).toEqual('<svg width="100" height="100"></svg>');
    });

    it('should do exit', () => {
      const svg = container.append('svg');

      svg.append('g').attr('fill', 'pink');
      svg.append('g').attr('id', 'hello');

      appendOne(svg, 'g').attr('id', 'world');

      expect(container.html()).toEqual(
        trim(`
          <svg>
            <g fill="pink" id="world"></g>
          </svg>
        `)
      );
    });

    it('should accept a selector', () => {
      const svg = container.append('svg');

      svg.append('g');
      svg.append('g').attr('id', 'hello');

      appendOne(container, 'g', 'g#hello').attr('fill', 'pink');

      expect(container.html()).toEqual(
        trim(`
          <svg>
            <g></g>
            <g id="hello" fill="pink"></g>
          </svg>
        `)
      );
    });
  });

  describe('append()', () => {
    let container;
    let svg;

    beforeEach(() => {
      container = d3.select(document.body);
      container.html('');
      svg = container.append('svg');
    });

    it('should do update', () => {
      svg.append('g').attr('data-value', 4);
      svg.append('g').attr('data-value', 5);
      svg.append('g').attr('data-value', 6);

      append(svg, [1, 2, 3], 'g').attr('data-value', (d) => d);

      expect(container.html()).toEqual(
        trim(`
          <svg>
            <g data-value="1"></g>
            <g data-value="2"></g>
            <g data-value="3"></g>
          </svg>
        `)
      );
    });

    it('should do enter', () => {
      svg.append('g').attr('data-value', 4);

      append(svg, [1, 2, 3], 'g').attr('data-value', (d) => d);

      expect(container.html()).toEqual(
        trim(`
          <svg>
            <g data-value="1"></g>
            <g data-value="2"></g>
            <g data-value="3"></g>
          </svg>
        `)
      );
    });

    it('should do exit', () => {
      svg.append('g').attr('data-value', 1);
      svg.append('g').attr('data-value', 4);
      svg.append('g').attr('data-value', 5);
      svg.append('g').attr('data-value', 6);

      append(svg, [1, 2, 3], 'g').attr('data-value', (d) => d);

      expect(container.html()).toEqual(
        trim(`
          <svg>
            <g data-value="1"></g>
            <g data-value="2"></g>
            <g data-value="3"></g>
          </svg>
        `)
      );
    });

    it('should accept a selector', () => {
      svg.append('g').attr('class', 'data');
      svg.append('g').attr('data-value', 4);
      svg.append('g').attr('class', 'data');
      svg.append('g').attr('data-value', 6);

      append(svg, [1, 2, 3], 'g', 'g.data')
        .attr('data-value', (d) => d)
        .attr('class', 'data');

      expect(container.html()).toEqual(
        trim(`
          <svg>
            <g class="data" data-value="1"></g>
            <g data-value="4"></g>
            <g class="data" data-value="2"></g>
            <g data-value="6"></g>
            <g data-value="3" class="data"></g>
          </svg>
        `)
      );
    });
  });
});
