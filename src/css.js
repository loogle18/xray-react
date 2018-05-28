module.exports = `
  .xray-react-enabled {
    margin-bottom: 50px !important;
  }
  .xray-react-elements-wrapper {
    bottom: 0;
    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-style: normal;
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
  .xray-react-element:hover,
  .xray-react-element.-highlighted {
    background-color: rgba(0, 0, 255, 0.75);
    border-color: cyan;
  }
  .xray-react-element:hover::before,
  .xray-react-element.-highlighted::before {
    color: cyan;
  }
  .xray-react-element:hover::after,
  .xray-react-element.-highlighted::after {
    background-color: cyan;
    color: darkblue;
  }
  .xray-react-element.-highlighted {
    z-index: 99999 !important;
  }
  .xray-react-action-bar {
    background-color: darkblue;
    bottom: 0;
    height: 50px;
    padding: 0 10px;
    position: fixed;
    width: 100vw;
    z-index: 999999;
  }
  .xray-react-actions-wrapper {
    align-items: center;
    display: flex;
    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-style: normal;
    height: inherit;
    max-width: 1200px;
  }
  #search-component {
    background-color: lightgray;
    border-radius: 3px;
    border: 0;
    flex-grow: 1;
    font-size: 14px;
    outline: 0;
    padding: 5px 10px;
  }
  .settings {
    margin-left: 20px;
    min-width: 320px;
  }
`;