const React = require('react');
const ReactDOMServer = require('react-dom/server');

const createPredicate = require('./to-be-published/get-js-from-url');
const tryGetCached = require('./to-be-published/try-get-cached');

module.exports = (options, callback) => {
  try {
    const url = options.model.preactComponent.src;
    const key = options.model.preactComponent.key;
    const props = options.model.preactComponent.props;
    const extractor = (key, context) => context.oc.preactComponents[key];
    const getJsFromUrl = createPredicate({
      key,
      url,
      extractor,
    });

    tryGetCached('preactComponent', key, getJsFromUrl, (err, CachedApp) => {
      if (err) return callback(err);
      try {
        const reactHtml = ReactDOMServer.renderToString(React.createElement(CachedApp, props));

        const html = options.template(
          Object.assign({}, options.model, {
            __html: reactHtml,
          })
        );
        return callback(null, html);
      } catch (error) {
        return callback(error);
      }
    });
  } catch (err) {
    return callback(err);
  }
};
