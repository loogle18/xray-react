const fs = require('fs');
const path = require('path');
const { serverIO } = require('../src/server');
const { exec } = require('child_process');


const XrayReactPlugin = function(params = {}) {
  this.params = params;
  this.runServer = typeof params.server !== 'undefined' ? params.server : true;
  this.sources = {};
  this.editor = process.env.XRAY_REACT_EDITOR;
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
    let sourcesArray = [fs.readFileSync(pathToUIFile, 'utf8')];
    if (this.runServer) sourcesArray += fs.readFileSync(pathToClientFile, 'utf8');
    asset._source.children.push(...sourcesArray);
    callback();
  });

  if (this.runServer) {
    compiler.plugin('compilation', (compilation, params) => {
      this.params.sourcePath = this.params.sourcePath || compilation.options.context;
  
      compilation.plugin('after-optimize-modules', (modules) => {
        for (let { resource, _source } of modules) {
          if (this.checkModuleResource(resource)) {
            let fileName = path.basename(resource, path.extname(resource));
            if (this.sources.hasOwnProperty(fileName) && this.sources[fileName].resource === resource) {
              continue;
            } else {
              this.sources[fileName] = { resource, source: _source._value };
            }
          }
        }
      });
    });
    
    compiler.plugin('done', () => {
      serverIO.on('connection', (socket) => {
        socket.on('xray-react-component', (name) => {
          let filepath = (this.sources[name] || {}).resource;
          if (this.editor && filepath) {
            exec(`${this.editor} -a ${filepath}`, function(error) {
              if (error) console.error(error);
            });
          }
        });
      });
  
      process.on('SIGINT', function() {
        serverIO.close();
        process.exit(0);
      });
    });
  }
};

module.exports = {
  XrayReactPlugin
};
