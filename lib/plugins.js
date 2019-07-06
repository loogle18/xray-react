const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const REACT_FILE_EXTS = ['.jsx', '.js'];


const XrayReactPlugin = function(params = {}) {
  this.params = params;
  this.runServer = typeof params.server !== 'undefined' ? params.server : true;
  this.sources = {};
  this.serverIO = null;
};

XrayReactPlugin.prototype = {
  get editorCmd() {
    const { XRAY_REACT_EDITOR } = process.env;
    if (typeof XRAY_REACT_EDITOR !== 'undefined') return XRAY_REACT_EDITOR + ' -a';
    switch (process.platform) { 
      case 'darwin': return 'open';
      case 'win32': return 'start';
      case 'win64': return 'start';
      default: return 'xdg-open';
   }
  }
};

XrayReactPlugin.prototype.getOutputFileName = function(options = {}) {
  return this.params.output ||
    (options && options.output ? options.output.filename : null) ||
    'bundle.js';
};

XrayReactPlugin.prototype.checkModuleResource = function(resource, sourcePath) {
  if (resource) {
    let isNeededSource = resource.includes(sourcePath) && !resource.includes('/node_modules/');
    let isNeededFileExt = REACT_FILE_EXTS.includes(path.extname(resource));
    return isNeededSource && isNeededFileExt;
  }
  return false;
};

XrayReactPlugin.prototype.openFile = function(filepath) {
  exec(`${this.editorCmd} ${filepath}`, function(error) {
    if (error) console.error(error);
  });
};

XrayReactPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    let dirname = process.cwd() || path.resolve(__dirname);
    let pathToUIFile = path.resolve(dirname, 'node_modules/xray-react/build/xray-react-ui.min.js');
    let pathToClientFile = path.resolve(dirname, 'node_modules/xray-react/build/xray-react-client.min.js');
    let outputFileName = this.getOutputFileName(compilation.options);
    let asset = compilation.assets[outputFileName];
    if (!asset) {
      for (let name of Object.keys(compilation.assets)) {
        if (name.includes('.js')) {
          asset = compilation.assets[name];
        }
      }
    }
    if (asset) {
      let sourcesArray = [fs.readFileSync(pathToUIFile, 'utf8')];
      if (this.runServer) sourcesArray += fs.readFileSync(pathToClientFile, 'utf8');
      asset._source.children.push(...sourcesArray);
    } else {
      console.error('\n\nCould not find available assets, please provide output filename for XrayReactPlugin.\n\n');
    }
    callback();
  });

  if (this.runServer) {
    compiler.plugin('compilation', (compilation, _params) => {
      compilation.plugin('after-optimize-modules', (modules) => {
        let sourcePath = this.params.sourcePath || compilation.options.context;
        for (let { resource } of modules) {
          if (this.checkModuleResource(resource, sourcePath)) {
            let fileName = path.basename(resource, path.extname(resource));
            if (this.sources.hasOwnProperty(fileName)) continue;
            this.sources[fileName] = resource;
          }
        }
      });
    });
    
    compiler.plugin('done', () => {
      this.serverIO = this.serverIO || require('socket.io')(8124);
      this.serverIO.on('connection', (socket) => {
        socket.on('xray-react-component', (structure) => {
          if (structure) {
            for (let name of structure.split(' -> ').reverse())  {
              let filepath = this.sources[name];
              if (filepath) {
                this.openFile(filepath);
                break;
              }
            }
          }
        });
      });

      process.once('SIGINT', () => {
        this.serverIO.close();
        process.exit(0);
      });
    });
  }
};

module.exports = {
  XrayReactPlugin
};
