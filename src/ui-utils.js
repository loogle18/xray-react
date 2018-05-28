const constants = require('./constants');
const partials = require('./partials');


const handleSearchChange = function(event) {
  let value = event.target.value.toLowerCase();
  let regExp = new RegExp(`^${value}|${value}$`);
  for (let elem of document.querySelectorAll(`.xray-react-element`)) {
    elem.classList.add('-highlighted');
    if (value.length >= 2 && elem.getAttribute('data-xray-react-element-search-name').match(regExp)) {
      elem.classList.add('-highlighted');
    } else {
      elem.classList.remove('-highlighted');
    }
  }
};

const createElemForComponent = function(elem, componentName) {
  let xrayReactElem = document.createElement('div');
  let boundingClientRect = elem.getBoundingClientRect();
  xrayReactElem.className = constants.xrayReactElemClassName;
  xrayReactElem.setAttribute('data-xray-react-element-name', componentName);
  xrayReactElem.setAttribute('data-xray-react-element-search-name', componentName.toLowerCase());
  xrayReactElem.style.height = boundingClientRect.height + 'px';
  xrayReactElem.style.width = boundingClientRect.width + 'px';
  xrayReactElem.style.top = boundingClientRect.top + window.scrollY + 'px';
  xrayReactElem.style.right = boundingClientRect.right + window.scrollX + 'px';
  xrayReactElem.style.bottom = boundingClientRect.bottom - window.scrollY + 'px';
  xrayReactElem.style.left = boundingClientRect.left - window.scrollX + 'px';
  xrayReactElem.style.zIndex = constants.zIndex;
  return xrayReactElem;
};

const searchAndCreateComponentCached = function() {
  let uids = [];
  return function(...args) {
    let elem = args[0];
    for (const key of Object.keys(elem)) {
      if (key.startsWith('__reactInternalInstance$')) {
        let fiberNode = elem[key];
        if (fiberNode._currentElement) {
          let owner = fiberNode._currentElement._owner;
          let fiber = owner && owner._instance;
          if (fiber) {
            let uid = `${owner._mountIndex}${owner._mountOrder}`;
            if (!uids.includes(uid)) {
              uids.push(uid);
              return createElemForComponent(elem, fiber.constructor.name);
            }
          }
        } else {
          let fiber = fiberNode.return && fiberNode.return.stateNode && fiberNode.return.stateNode._reactInternalFiber;
          if (fiber) return createElemForComponent(elem, fiber.type.name);
        }
      }
    }
    return null;
  };
};

const toggleXrayReact = function(enable) {
  let body = document.body;
  if (body.classList.contains('xray-react-enabled')) {
    body.classList.remove('xray-react-enabled');
    let xrayReactElementsWrapper = document.querySelector('.xray-react-elements-wrapper');
    let xrayReactActionBar = document.querySelector('.xray-react-action-bar');
    let xrayReactStyleTag = document.querySelector('.xray-react-style-tag');
    if (xrayReactElementsWrapper) xrayReactElementsWrapper.remove();
    if (xrayReactActionBar) xrayReactActionBar.remove();
    if (xrayReactStyleTag) xrayReactStyleTag.remove();
  } else {
    body.classList.add('xray-react-enabled');
    let xrayReactElements = [];
    let searchAndCreateComponent = searchAndCreateComponentCached();
    for (let elem of body.getElementsByTagName('*')) {
      let xrayReactElem = searchAndCreateComponent(elem);
      if (xrayReactElem) xrayReactElements.push(xrayReactElem);
    }
    let xrayReactElementsWrapper = document.createElement('div');
    xrayReactElementsWrapper.className = 'xray-react-elements-wrapper';
    xrayReactElementsWrapper.append(...xrayReactElements);
    body.append(xrayReactElementsWrapper);
    document.head.insertAdjacentHTML('beforeend', partials.styleTag);
    body.insertAdjacentHTML('beforeend', partials.actionBar);
    document.getElementById('search-component').addEventListener('input', handleSearchChange);
  }
};

const handleXrayReactToggle = function() {
  let keyMap = { 16: false, 82: false, 88: false };
  document.body.addEventListener('keydown', function(event) {
    if (event.keyCode in keyMap) {
      keyMap[event.keyCode] = true;
      if (keyMap[16] && keyMap[82] && keyMap[88]) {
        toggleXrayReact();
      }
    }
  });
  document.body.addEventListener('keyup', function(event) {
    if (event.keyCode in keyMap) {
      keyMap[event.keyCode] = false;
    }
  });
};

const enableXrayReact = function() {
  window.onload = handleXrayReactToggle();
};

module.exports = {
  enableXrayReact
};