import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'lib/xray-react-ui.js',
  output: {
    file: 'build/xray-react-ui.min.js',
    format: 'iife',
    name: 'xrayReactUiMin',
    sourceMap: 'inline'
  },
  plugins: [
    commonjs()
  ]
};