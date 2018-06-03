import commonjs from 'rollup-plugin-commonjs';


let plugins = [
  commonjs()
];

export default [{
  input: 'lib/xray-react-ui.js',
  output: {
    file: 'build/xray-react-ui.min.js',
    format: 'iife',
    name: 'xrayReactUiMin',
    sourceMap: 'inline'
  },
  plugins: plugins
},
{
  input: 'lib/xray-react-client.js',
  output: {
    file: 'build/xray-react-client.min.js',
    format: 'iife',
    name: 'xrayReactClientMin',
    sourceMap: 'inline'
  },
  plugins: plugins
}];
