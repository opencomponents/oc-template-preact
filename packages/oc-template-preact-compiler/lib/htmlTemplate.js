const viewTemplate = ({ templateId, css, bundle, hash }) => `function(model){
  var modelHTML =  model.__html ? model.__html : '';
  var staticPath = model.preactComponent.props._staticPath;
  var props = JSON.stringify(model.preactComponent.props);
  window.oc = window.oc || {};
  window.oc.__typescriptReactTemplate = window.oc.__typescriptReactTemplate || { count: 0 };
  oc.preactComponents = oc.preactComponents || {};
  oc.preactComponents['${hash}'] = oc.preactComponents['${hash}'] || (${bundle});
  var count = window.oc.__typescriptReactTemplate.count;
  var templateId = "${templateId}-" + count;
  window.oc.__typescriptReactTemplate.count++;
  return '<div id="' + templateId + '" class="${templateId}">' + modelHTML + '</div>' +
    '${css ? '<style>' + css + '</style>' : ''}' +
    '<script>' +
    'window.oc = window.oc || {};' +
    'oc.cmd = oc.cmd || [];' +
    'oc.cmd.push(function(oc){' +
    '${css ? "oc.events.fire(\\'oc:cssDidMount\\', \\'" + css + "\\');" : ''}' +
      'var targetNode = document.getElementById("' + templateId + '");' +
      'targetNode.setAttribute("id","");' +
      'oc.preactComponents["${hash}"](' + props + ', targetNode);' +
    '});' +
  '</script>'
}`;

module.exports = viewTemplate;
