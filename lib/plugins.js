const fs = require('fs');
const path = require('path');

const XrayReactPlugin = function(options = {}) {
  this.options = options;
};

XrayReactPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {
    let asset;
    let dirname = process.cwd() || path.resolve(__dirname);
    let pathToFile = path.resolve(dirname, 'node_modules/xray-react/build/xray-react-ui.min.js');
    let source = fs.readFileSync(pathToFile, 'utf8');
    try {
      let outputFileName = this.options.output || 'bundle.js';
      asset = compilation.assets[outputFileName] || Object.values(compilation.assets)[0];
    } catch (err) {
      console.error('\n\nCould not find available assets, please provide output filename for XrayReactPlugin.\n\n');
    }
    asset._source.children.push(source);
		callback();
	});
};

module.exports = {
  XrayReactPlugin
};