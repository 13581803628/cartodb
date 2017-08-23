var js_files = require('../files/js_files');

module.exports = {
  cartodbui: {
    src: js_files.all.concat([
      'lib/build/user_data.js',
      '<%= assets_dir %>/javascripts/templates_mustache.js',
      '<%= assets_dir %>/javascripts/templates.js',
      'lib/build/test_init.js']),
    options: {
      keepRunner: true, // do not delete the runner (added to gitignore anyway), makes sure the runner is up-to-date
      outfile: '_SpecRunner.html',
      summary: true,
      display: 'short',
      specs: js_files.specs,
      helpers: ['http://maps.googleapis.com/maps/api/js?sensor=false&v=3.12'].concat(js_files._spec_helpers)
    // '--remote-debugger-port': 9000
    }
  },

  affected: {
    options: {
      timeout: 20000,
      keepRunner: true,
      outfile: '_SpecRunner-affected.html',
      summary: true,
      display: 'full',
      helpers: js_files._spec_helpers3,
      specs: [
        '.grunt/vendor.affected-specs.js',
        '.grunt/main.affected-specs.js'
      ],
      vendor: [
        'node_modules/jasmine-ajax/lib/mock-ajax.js',
        'node_modules/underscore/underscore-min.js']
    }
  }
};
