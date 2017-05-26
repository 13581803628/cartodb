var _ = require('underscore');
var Backbone = require('backbone');
var editorsWithoutTrackClass = ['Base', 'Object', 'NestedModel'];
var editorsNotInCARTO = ['Checkbox', 'Checkboxes', 'Date'];

var OPTIONS_BY_TYPE = {
  'EnablerEditor': {
    editor: {
      type: 'Text'
    }
  },
  'Slider': {
    labels: ['hello', 'hey']
  },
  'Fill': {
    model: new Backbone.Model({
      names: 'pepe',
      stroke: {
        size: {
          range: [1, 30],
          attribute: 'the_geom',
          quantification: 'Quantile'
        },
        color: {
          bins: 5,
          range: ['#FFFFFF', '#FABADA', '#00FF00', '#000000', '#999999'],
          attribute: 'column1',
          quantification: 'Jenks',
          opacity: 0.5
        }
      }
    }),
    schema: {
      configModel: {},
      query: 'SELECT * from table',
      options: [
        { label: 'column1', type: 'number' },
        { label: 'column2', type: 'number' },
        { label: 'column3', type: 'number' }
      ]
    }
  },
  'TagList': {
    schema: {
      options: {
        tags: ['foo', 'bar', 'lol'],
        isEditable: true
      }
    }
  },
  'DataObservatoryDropdown': {
    configModel: new Backbone.Model({
      base_url: '/u/foo',
      user_name: 'foo',
      sql_api_template: 'foo',
      api_key: 'foo'
    }),
    layerDefinitionModel: {
      getTableName: () => {
        return 'wadus';
      },
      getAnalysisDefinitionNodeModel: () => {
        var sourceNode = new Backbone.Model({
          type: 'source',
          table_name: 'wadus'
        });
        sourceNode.querySchemaModel = new Backbone.Model();
        return sourceNode;
      }
    }
  }
};

describe('components/form-components/editors/track-class', () => {
  describe('trackingClass for', () => {
    _.each(Backbone.Form.editors, function (_class, key) {
      if (_.contains(editorsWithoutTrackClass, key) || _.contains(editorsNotInCARTO, key)) {
        return false;
      }

      var options = _.extend(
        {
          key: 'example',
          schema: {
            options: []
          },
          model: new Backbone.Model({ example: 'a' })
        },
        OPTIONS_BY_TYPE[key] || {}
      );

      describe(key, () => {
        it('should not add the class if it not is specified', () => {
          var view = new _class(options);
          expect(view.$el.hasClass('track-class-whatever')).toBeFalsy();
          expect(view.options.trackingClass).toBeUndefined();
        });

        it('should add the class if it is specified', () => {
          var view = new _class(
            _.extend(options, {
              trackingClass: 'track-class-whatever'
            })
          );

          expect(view.$el.hasClass('track-class-whatever')).toBeTruthy();
        });
      });
    });
  });
});
