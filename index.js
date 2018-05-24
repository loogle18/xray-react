(function() {
  let css = `
    .xray-react-elements-wrapper {
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }
    .xray-react-element {
      background-color: rgba(0, 0, 255, 0.25);
      border: 2px solid blue;
      cursor: pointer;
      position: absolute;
    }
    .xray-react-element::before {
      align-self: center;
      color: white;
      content: attr(data-xray-react-element-name);
      display: table;
      font-size: 18px;
      font-weight: 400;
      left: 50%;
      position: absolute;
      right: 0;
      text-align: center;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .xray-react-element::after {
      background-color: darkblue;
      color: white;
      content: attr(data-xray-react-element-name);
      display: inline-block;
      font-size: 10px;
      left: 0;
      padding: 0 5px;
      position: absolute;
      top: 0;
    }
    .xray-react-element:hover {
      background-color: rgba(0, 0, 255, 0.75);
      border-color: cyan;
    }
    .xray-react-element:hover::before {
      color: cyan;
    }
    .xray-react-element:hover::after {
      background-color: cyan;
      color: darkblue;
    }
    .xray-react-action-bar {
      background-color: darkblue;
      height: 40px;
      position: relative;
    }
  `;
  let actionBar = '<div class="xray-react-action-bar"></div>'
  let elements = document.body.getElementsByTagName('*');
  let xrayReactElements = [];
  const xrayReactElemClassName = 'xray-react-element';
  const zIndex = 10000;
  const windowScrollX = window.scrollX;
  const windowScrollY = window.scrollY;
  const createElemForComponent = function(elem) {
    for (const key of Object.keys(elem)) {
      if (key.startsWith('__reactInternalInstance$')) {
        let fiberNode = elem[key];
        let fiber = fiberNode && fiberNode.return && fiberNode.return.stateNode && fiberNode.return.stateNode._reactInternalFiber;
        if (fiber) {
          let xrayReactElem = document.createElement('div');
          let boundingClientRect = elem.getBoundingClientRect();
          xrayReactElem.className = xrayReactElemClassName;
          xrayReactElem.setAttribute('data-xray-react-element-name', fiber.type.name);
          xrayReactElem.style.height = boundingClientRect.height + 'px';
          xrayReactElem.style.width = boundingClientRect.width + 'px';
          xrayReactElem.style.top = boundingClientRect.top + windowScrollY + 'px';
          xrayReactElem.style.right = boundingClientRect.right + windowScrollX + 'px';
          xrayReactElem.style.bottom = boundingClientRect.bottom - windowScrollY + 'px';
          xrayReactElem.style.left = boundingClientRect.left - windowScrollX + 'px';
          xrayReactElem.style.zIndex = zIndex;
          return xrayReactElem;
        }
      }
    }
    return null;
  };

  const main = function() {
    for (let elem of elements) {
      let xrayReactElem = createElemForComponent(elem);
      if (xrayReactElem) xrayReactElements.push(xrayReactElem);
    }
    let styleTag = document.createElement('style');
    let xrayReactElementsWrapper = document.createElement('div');
    xrayReactElementsWrapper.className = 'xray-react-elements-wrapper';
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);
    xrayReactElementsWrapper.append(...xrayReactElements);
    document.body.append(xrayReactElementsWrapper);
    document.body.insertAdjacentHTML('beforeend', actionBar);
  };

  main();
})();