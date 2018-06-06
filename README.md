# X-Ray React
React layout debugger inspired by [Xray-rails](https://github.com/brentd/xray-rails)

#### Suppoted versions:
React: 15.x.x, 16.x.x

Webpack: 2.x.x, 3.x.x

## Installation

`npm install xray-react`

## Usage

#### As a plugin for webpack:
```javascript
// webpack.config.js
const { XrayReactPlugin } = require('xray-react');

if(env.development) {
    plugins.push(new XrayReactPlugin());
}
```

Environment variables:
- `XRAY_REACT_EDITOR` - path or alias for editor's exec file, which will open files on component click.
  
  Example:
  ```bash
  export XRAY_REACT_EDITOR='/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code'
  # or
  export XRAY_REACT_EDITOR=code
  ```

Arguments
- `output` - (string) name of output filename. Default is **'bundle.js'** or **first available asset**.
- `server` - (boolean) flag that specifies whether or not to run server for handling files opening on component click. Default is **true**. _If this option is set to true, please be sure you have exported 'XRAY_REACT_EDITOR' env variable._
- `sourcePath` - (string) absolute path to internal sources like components etc (e.g. `/home/user/project/client/src`). Default is **compilation context**.


#### As a module:
```javascript
// index.js
import 'xray-react/lib/xray-react-ui';
```

Press **ctrl+x+r** to toggle xray-react ui

![Example](media/example.gif)
