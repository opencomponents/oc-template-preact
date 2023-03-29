const state = {};
module.exports = (opts, cb) => {
  var jsText =
    state.jsText ||
    `var oc = {preactComponents: {}}; oc.preactComponents['666'] = class Hello extends React.Component {
    render() {
      return React.createElement("div", null, "Hello World");
    }
  }`;
  return cb(null, jsText);
};

module.exports.__setResponse = (jsText) => {
  state.jsText = jsText;
};
