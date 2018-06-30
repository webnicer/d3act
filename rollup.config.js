import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import pkg from './package.json';

export default [
  // UMD (browser-friendly) build.
  {
    input: 'src/index.js',
    output: {
      file: pkg.browser,
      name: 'd3actor',
      format: 'umd',
      globals: {
        d3: 'd3'
      }
    },
    external: ['d3'],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/**']
      }),
      uglify()
    ]
  },
  // CommonJS (for Node) build with no babel.
  {
    input: 'src/index.js',
    output: {
      file: pkg.main,
      format: 'cjs'
    },
    external: ['d3'],
    plugins: [resolve()]
  },
  // ES module (for bundlers) build.
  {
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'es'
    },
    external: ['d3'],
    plugins: [
      resolve(),
      babel({
        exclude: ['node_modules/**']
      })
    ]
  }
];
