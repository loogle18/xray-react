const constants = require('./src/constants');
const partials = require('./src/partials');
const { memoize } = require('./src/utils');


const getWindowScroll = memoize(() => Object({ x: window.scrollX, y: window.scrollY }));

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

const createElemForComponent = function(elem) {
  for (const key of Object.keys(elem)) {
    if (key.startsWith('__reactInternalInstance$')) {
      let fiberNode = elem[key];
      let fiber = fiberNode && fiberNode.return && fiberNode.return.stateNode && fiberNode.return.stateNode._reactInternalFiber;
      if (fiber) {
        let componentName = fiber.type.name;
        let xrayReactElem = document.createElement('div');
        let boundingClientRect = elem.getBoundingClientRect();
        xrayReactElem.className = constants.xrayReactElemClassName;
        xrayReactElem.setAttribute('data-xray-react-element-name', componentName);
        xrayReactElem.setAttribute('data-xray-react-element-search-name', componentName.toLowerCase());
        xrayReactElem.style.height = boundingClientRect.height + 'px';
        xrayReactElem.style.width = boundingClientRect.width + 'px';
        xrayReactElem.style.top = boundingClientRect.top + getWindowScroll().y + 'px';
        xrayReactElem.style.right = boundingClientRect.right + getWindowScroll().x + 'px';
        xrayReactElem.style.bottom = boundingClientRect.bottom - getWindowScroll().y + 'px';
        xrayReactElem.style.left = boundingClientRect.left - getWindowScroll().x + 'px';
        xrayReactElem.style.zIndex = constants.zIndex;
        return xrayReactElem;
      }
    }
  }
  return null;
};

const enableXrayReact = function() {
  let xrayReactElements = [];
  for (let elem of document.body.getElementsByTagName('*')) {
    let xrayReactElem = createElemForComponent(elem);
    if (xrayReactElem) xrayReactElements.push(xrayReactElem);
  }
  let xrayReactElementsWrapper = document.createElement('div');
  xrayReactElementsWrapper.className = 'xray-react-elements-wrapper';
  xrayReactElementsWrapper.append(...xrayReactElements);
  document.body.append(xrayReactElementsWrapper);
  document.head.insertAdjacentHTML('beforeend', partials.styleTag);
  document.body.insertAdjacentHTML('beforeend', partials.actionBar);
  document.getElementById('search-component').addEventListener('input', handleSearchChange);
};

module.exports = {
  enableXrayReact
};
