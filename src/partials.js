const css = require('./css');

const styleTag = `<style class="xray-react-style-tag">${css}</style>`;
const actionBar = `
  <div class="xray-react-action-bar">
    <div class="xray-react-actions-wrapper">
      <input id="search-component" type="text" placeholder="Search component by name..."/>
      <div class="settings"></div>
    </div>
  </div>
`;

module.exports = {
  styleTag,
  actionBar
};