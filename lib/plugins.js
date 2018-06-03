const fs = require('fs');
const path = require('path');
const { serverIO } = require('../src/server');


const XrayReactPlugin = function(params = {}) {
  this.params = params;
};

XrayReactPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    let asset;
    let dirname = process.cwd() || path.resolve(__dirname);
    let pathToUIFile = path.resolve(dirname, 'node_modules/xray-react/build/xray-react-ui.min.js');
    let pathToClientFile = path.resolve(dirname, 'node_modules/xray-react/build/xray-react-client.min.js');
    try {
      let outputFileName = typeof this.params.output === 'string' && this.params.output || 'bundle.js';
      asset = compilation.assets[outputFileName] || compilation.assets[Object.keys(compilation.assets)[0]];
    } catch (err) {
      console.error('\n\nCould not find available assets, please provide output filename for XrayReactPlugin.\n\n');
    }
    let sourceUI = fs.readFileSync(pathToUIFile, 'utf8');
    let sourceClient = fs.readFileSync(pathToClientFile, 'utf8');
    asset._source.children.push(sourceUI, sourceClient);
    callback();
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
