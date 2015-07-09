var cdb = require('cartodb.js');
var Backbone = require('backbone');

/**
 *  Visualization template model
 *
 *  - It will contain the information about
 *  an already created visualization template.
 *
 */

module.exports = cdb.core.Model.extend({

  defaults: {
    source_visualization_id: '',
    name: 'Map template',
    description: '',
    times_used: 0,
    code: '',
    related_tables: [],
    selected: false
  },

  // Valid methods or functions or variables
  // within javascript code
  _VALID_FUNCTIONS: [
    'onStepFinished',
    'onWizardFinished',
    'getStep',
    'getStepNames'
  ],

  initialize: function(attrs) {
    this.validationError = '';
    this._initBinds();
    this._validate(attrs, { validate: true });
    this._setModel();
  },

  _validate: function(attrs, options) {
    var valid = cdb.core.Model.prototype._validate.apply(this, arguments);
    // This follows Backbone way about how to validate a model
    if (valid) {
      this.trigger('valid')
      return true;
    } else {
      return false;
    }
  },

  validate: function(attrs) {
    if (!attrs) return;
    var templateCode = attrs.code;
    var name = attrs.name;

    if (!attrs.code) {
      return name + ": template code not provided"
    }

    // Evaluate code
    try {
      var code = eval("_cdbTemplate = " + templateCode);
    } catch(e) {
      return name + ": template code error \n " + e
    }

    // Validate code methods
    _.each(this._VALID_FUNCTIONS, function(method) {
      if (!code[method]) {
        return name + ": '" + method + "' template function should be defined";  
      }
    });
  },

  _initBinds: function() {
    this.bind('change:code', this._setModel, this);
    this.bind('valid', function() {
      this.validationError = '';
    }, this);
    this.bind('error', function(m, error) {
      this.validationError = error;
      // Show error in console
      cdb.log.info(this.validationError);
    }, this);
  },

  _setModel: function() {
    var code = eval("_cdbTemplate = " + this.get('code'));
    // TODO: pick only valid methods + steps?
    _.extend(this, code);
  },

  getError: function() {
    return this.validationError;
  }

})