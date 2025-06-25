import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src'
      }),
      production && terser()
    ]
  },
  
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'Unified4D',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true
      }),
      production && terser()
    ]
  },
  
  // Core module
  {
    input: 'src/core/Unified4DEngine.ts',
    output: {
      file: 'dist/core.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true
      }),
      production && terser()
    ]
  },
  
  // Utils module
  {
    input: 'src/utils/helpers.ts',
    output: {
      file: 'dist/utils.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true
      }),
      production && terser()
    ]
  }
].filter(Boolean);