const { xrayReactElemCN, xrayReactCompPathAttr } = require('../src/constants');


const ClientIO = function() {
  this.client = null;
};

ClientIO.prototype.addScript = function() {
  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js';

  return new Promise((resolve) => {
    script.addEventListener('load', function(e) {
      resolve(true);
      script.remove();
    });

    script.addEventListener('error', function(e) {
      resolve(false);
      script.remove();
    });

    document.body.appendChild(script);
  });
};

ClientIO.prototype.init = function() {
  return new Promise((resolve) => {
    if (typeof window.io === 'undefined') {
      this.addScript().then((isSuccess) => {
        if (isSuccess) {
          this.client = window.io.connect('http://127.0.0.1:8124');
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } else {
      this.client = window.io.connect(window.location.origin);
      resolve(true);
    }
  });
};

const initIOAndListeners = function() {
  const clientIO = new ClientIO();
  clientIO.init().then((isSuccess) => {
    if (isSuccess) {
      document.body.addEventListener('click', function(event) {
        let target = event.target;
        if (target.className.includes(xrayReactElemCN)) {
          clientIO.client.emit('xray-react-component', target.getAttribute(xrayReactCompPathAttr));
        }
      });
    }
  });
};

window.onload = function() {
  initIOAndListeners();
};