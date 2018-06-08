const constants = require('./constants');
const partials = require('./partials');


const handleSearchChange = function(event) {
  let value = event.target.value.toLowerCase();
  let regExp = new RegExp(`^${value}|${value}$`);
  for (let elem of document.querySelectorAll(`.${constants.xrayReactElemCN}`)) {
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
  xrayReactElem.className = constants.xrayReactElemCN;
  xrayReactElem.setAttribute('data-xray-react-element-name', componentName);
  xrayReactElem.setAttribute('data-xray-react-element-search-name', componentName.toLowerCase());
  xrayReactElem.style.height = boundingClientRect.height + 'px';
  xrayReactElem.style.width = boundingClientRect.width + 'px';
  xrayReactElem.style.top = boundingClientRect.top + window.scrollY + 'px';
  xrayReactElem.style.right = boundingClientRect.right + window.scrollX + 'px';
  xrayReactElem.style.bottom = boundingClientRect.bottom - window.scrollY + 'px';
  xrayReactElem.style.left = boundingClientRect.left - window.scrollX + 'px';
  xrayReactElem.style.zIndex = constants.zIndex;
  return { elem, xrayReactElem };
};

const getComponentObj = function(elem) {
  for (const key of Object.keys(elem)) {
    if (key.startsWith('__reactInternalInstance$')) {
      let fiberNode = elem[key];
      if (fiberNode._currentElement) {
        let owner = fiberNode._currentElement._owner;
        let fiber = owner && owner._instance;
        if (fiber) {
          return { name: fiber.constructor.name, uid: `${owner._mountIndex}${owner._mountOrder}` };
        }
      } else {
        let fiber = fiberNode.return && fiberNode.return.stateNode && fiberNode.return.stateNode._reactInternalFiber;
        if (fiber) return { name: fiber.type.name };
      }
    }
  }
  return {};
};

const searchAndCreateComponentCached = function() {
  let uids = [];
  return function(...args) {
    let elem = args[0];
    let { name, uid } = getComponentObj(elem);

    if (name) {
      if (uid) {
        if (!uids.includes(uid)) {
          uids.push(uid);
          return createElemForComponent(elem, name);
        }
      } else {
        return createElemForComponent(elem, name);
      }
    }
    return null;
  };
};

const addAsoluteComponentPath = function(elem, xrayReactElem) {
  let originElem = elem;
  let structure = xrayReactElem.getAttribute('data-xray-react-element-name') || '';
  while (elem.parentNode) {
    elem = elem.parentNode;
    let { name: component } = getComponentObj(elem);
    if (component) structure = component + ' -> ' + structure;
  }
  xrayReactElem.setAttribute(constants.xrayReactCompPathAttr, structure);
};

const onXrayReactMouseover = function(event) {
  let { target } = event;
  if (target.classList.contains(constants.xrayReactElemCN)) {
    let componentsPath = target.getAttribute(constants.xrayReactCompPathAttr) || '';
    document.querySelector('.xray-react-actions-wrapper .components-path').innerHTML = componentsPath;
  }
}

const toggleXrayReact = function(enable) {
  let body = document.body;
  if (body.classList.contains('xray-react-enabled')) {
    body.classList.remove('xray-react-enabled');
    let xrayReactElementsWrapper = document.querySelector(`.${constants.xrayReactWrapperCN}`);
    let xrayReactActionBar = document.querySelector('.xray-react-action-bar');
    let xrayReactStyleTag = document.querySelector('.xray-react-style-tag');
    if (xrayReactElementsWrapper) xrayReactElementsWrapper.remove();
    if (xrayReactActionBar) xrayReactActionBar.remove();
    if (xrayReactStyleTag) xrayReactStyleTag.remove();
    body.removeEventListener('mouseover', onXrayReactMouseover);
  } else {
    body.classList.add('xray-react-enabled');
    let xrayReactObjects = [];
    let searchAndCreateComponent = searchAndCreateComponentCached();
    for (let elem of body.getElementsByTagName('*')) {
      let xrayReactObj = searchAndCreateComponent(elem);
      if (xrayReactObj) xrayReactObjects.push(xrayReactObj);
    }
    for (let { elem, xrayReactElem } of xrayReactObjects) {
      addAsoluteComponentPath(elem, xrayReactElem);
    }
    let xrayReactElementsWrapper = document.createElement('div');
    xrayReactElementsWrapper.className = constants.xrayReactWrapperCN;
    xrayReactElementsWrapper.append(...xrayReactObjects.map(obj => obj.xrayReactElem));
    body.append(xrayReactElementsWrapper);
    document.head.insertAdjacentHTML('beforeend', partials.styleTag);
    body.insertAdjacentHTML('beforeend', partials.actionBar);
    document.getElementById('search-component').addEventListener('input', handleSearchChange);
    body.addEventListener('mouseover', onXrayReactMouseover);
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