const fs = require('fs');
const path = require('path');
const { serverIO } = require('../src/server');


const XrayReactPlugin = function(params = {}) {
  this.params = params;
  this.sources = new Set();
};

XrayReactPlugin.prototype.getOutputFileName = function(options = {}) {
  return this.params.output ||
    (options && options.output ? options.output.filename : null) ||
    'bundle.js';
};

XrayReactPlugin.prototype.checkModuleResource = function(resource) {
    if (resource) {
      let isNeededSource = resource.includes(this.params.sourcePath) && !resource.includes('/node_modules/');
      let isNeededFileExt = path.extname(resource).match(/^.?(jsx?|es6|coffee)$/);
      return isNeededSource && isNeededFileExt;
    }
    return false;
  };


XrayReactPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    let asset;
    let dirname = process.cwd() || path.resolve(__dirname);
    let pathToUIFile = path.resolve(dirname, 'node_modules/xray-react/build/xray-react-ui.min.js');
    let pathToClientFile = path.resolve(dirname, 'node_modules/xray-react/build/xray-react-client.min.js');
    try {
      let outputFileName = this.getOutputFileName(compilation.options);
      asset = compilation.assets[outputFileName] || compilation.assets[Object.keys(compilation.assets)[0]];
    } catch (err) {
      console.error('\n\nCould not find available assets, please provide output filename for XrayReactPlugin.\n\n');
    }
    let sourceUI = fs.readFileSync(pathToUIFile, 'utf8');
    let sourceClient = fs.readFileSync(pathToClientFile, 'utf8');
    asset._source.children.push(sourceUI, sourceClient);
    callback();
  });

  compiler.plugin('compilation', (compilation, params) => {
    this.params.sourcePath = this.params.sourcePath || compilation.options.context;

    compilation.plugin('after-optimize-modules', (modules) => {
      for (let { resource } of modules) {
        if (this.checkModuleResource(resource)) this.sources.add(resource);
      }
    });
  });
  
  compiler.plugin('done', () => {
    serverIO.on('connection', function(socket) {
      socket.on('xray-react-component', function(name) {
        console.log(name);
      });
    });

    process.on('SIGINT', function() {
      serverIO.close();
      process.exit(0);
    });
  });
};

module.exports = {
  XrayReactPlugin
};
