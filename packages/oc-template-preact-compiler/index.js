'use strict';

const compile = require('./lib/compile');
const template = require('oc-template-preact');

module.exports = {
  compile,
  getCompiledTemplate: template.getCompiledTemplate,
  getInfo: template.getInfo,
  render: template.render
};
