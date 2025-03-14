import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'iife', // Immediately Invoked Function Expression (compatible with p5.js)
    name: 'p5Sketch',
    sourcemap: false, // Keep it false for cleaner output
    indent: false,   // Prevent excessive indentation
    compact: false   // Keep the code readable
  },
  plugins: [typescript()],
};

