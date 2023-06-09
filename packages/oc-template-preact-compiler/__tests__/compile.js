jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

process.env.TSC_SKIP_TYPECHECK = 'true';

const _ = require('lodash');
const fs = require('fs-extra');
const nodeDir = require('node-dir');
const path = require('path');
const compile = require('../lib/compile.js');
jest.mock('oc-template-preact', () => ({
  getInfo() {
    return {
      version: '6.6.6'
    };
  }
}));

const componentPath = (name) => path.join(__dirname, `../../../mocks/${name}`);
const componentPackage = (name) =>
  fs.readJsonSync(path.join(__dirname, `../../../mocks/${name}`, 'package.json'));
const componentScenarios = (componentName) => ({
  'Happy path': {
    componentPackage: componentPackage(componentName),
    ocPackage: {
      version: '1.0.0'
    },
    production: true,
    componentPath: componentPath(componentName),
    publishPath: path.join(componentPath(componentName), '_compile-tests-package1')
  },
  'Should handle empty static folder': {
    componentPackage: (function () {
      const manifest = componentPackage(componentName);
      delete manifest.oc.files.static;
      return manifest;
    })(),
    ocPackage: {
      version: '1.0.0'
    },
    componentPath: componentPath(componentName),
    production: true,
    publishPath: path.join(componentPath(componentName), '_compile-tests-package2')
  },
  'Should handle server.js-less components': {
    componentPackage: (function () {
      const manifest = componentPackage(componentName);
      delete manifest.oc.files.data;
      return manifest;
    })(),
    ocPackage: {
      version: '1.0.0'
    },
    production: true,
    componentPath: componentPath(componentName),
    publishPath: path.join(componentPath(componentName), '_compile-tests-package4')
  }
});

const components = ['react-component', 'react-component-with-css', 'react-component-with-scss'].map(
  componentScenarios
);

const execute = (options, cb) => {
  compile(options, (err, result) => {
    if (err) {
      return fs.remove(options.publishPath, () => cb(err));
    }

    result.oc.date = '';
    result.oc.files.template.version = '';
    nodeDir.paths(options.publishPath, (err2, res2) => {
      const files = _.chain(res2.files)
        .map((filePath) => {
          const source = fs.readFileSync(filePath, 'UTF8');
          return {
            source: !filePath.match(/\.png$/)
              ? source
                .replace(/"date":\d+/, '')
                .replace(/"hashKey":".*?",/g, '')
                .replace(/omponents\['.*?'\]/g, "omponents['dummyContent']")
                .replace(/key:'.*?'/g, '')
                .replace(
                  /\["oc",.*?"preactComponents",.*?".*?"\]/g,
                  '["oc", "preactComponents", "dummyContent"]'
                )
              : 'img-binary',
            path: path.relative(__dirname, filePath)
          };
        })
        .sortBy(['path', 'source'])
        .value();
      fs.remove(options.publishPath, () => cb(err, { result, files }));
    });
  });
};

_.each(components, (scenarios) => {
  _.each(scenarios, (scenario, testName) => {
    test(testName, (done) => {
      execute(scenario, (err) => {
        expect(err).toBeNull();
        done();
      });
    });
  });
});

test('When server compilation fails should return an error', (done) => {
  const publishPath = path.join(componentPath('react-component'), '_compile-tests-package5');
  const options = {
    componentPackage: (function () {
      const manifest = componentPackage('react-component');
      manifest.oc.files.data = 'not-found.js';
      return manifest;
    })(),
    ocPackage: {
      version: '1.0.0'
    },
    componentPath: componentPath('react-component'),
    publishPath
  };

  execute(options, (err) => {
    expect(err).toContain('Module not found');
    fs.remove(publishPath, done);
  });
});

test('When files writing fails should return an error', (done) => {
  const publishPath = path.join(componentPath('react-component'), '_compile-tests-package6');
  const spy = jest
    .spyOn(fs, 'ensureDir')
    .mockImplementation(jest.fn((a, cb) => cb('sorry I failed')));

  const options = {
    componentPackage: componentPackage('react-component'),
    ocPackage: {
      version: '1.0.0'
    },
    componentPath: componentPath('react-component'),
    publishPath
  };

  execute(options, (err) => {
    expect(err).toMatchSnapshot();
    spy.mockRestore();
    fs.remove(publishPath, done);
  });
});
