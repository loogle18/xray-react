# X-Ray React
React layout debugger inspired by [Xray-rails](https://github.com/brentd/xray-rails)

## Usage

#### As a plugin for webpack:
```javascript
// webpack.config.js
const { XrayReactPlugin } = require('xray-react');

if(env.development) {
    plugins.push(new XrayReactPlugin());
}
```

#### As a module:
```javascript
// index.js
import 'xray-react/lib/xray-react-ui';
```

Press **ctrl+x+r** to toggle xray-react ui

![Example](media/example.gif)
