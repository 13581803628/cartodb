var Backbone = require('backbone');
var StyleModel = require('../../../../../../javascripts/cartodb3/editor/style/style-definition-model');
var QuerySchemaModel = require('../../../../../../javascripts/cartodb3/data/query-schema-model');
var QueryGeometryModel = require('../../../../../../javascripts/cartodb3/data/query-geometry-model');
var LayerDefinitionsCollection = require('../../../../../../javascripts/cartodb3/data/layer-definitions-collection');
var StyleAnimatedPropertiesFormView = require('../../../../../../javascripts/cartodb3/editor/style/style-form/style-properties-form/style-animated-properties-form-view');
var FactoryModals = require('../../../factories/modals');

describe('editor/style/style-form/style-animated-properties-form-view', () => {
  beforeEach(() => {
    this.styleModel = new StyleModel({
      overlap: true
    }, { parse: true });

    this.querySchemaModel = new QuerySchemaModel({
      status: 'fetched'
    }, {
      configModel: {}
    });

    this.queryGeometryModel = new QueryGeometryModel({status: 'fetched'}, {configModel: {}});
    this.queryGeometryModel.set('simple_geom', 'point');

    this.layerDefinitionsCollection = new LayerDefinitionsCollection([], {
      analysisDefinitionNodesCollection: new Backbone.Collection(),
      configModel: {},
      mapId: 'map-123',
      stateDefinitionModel: {},
      userModel: {
        featureEnabled: () => { return true; }
      }
    });
    spyOn(this.layerDefinitionsCollection, 'isThereAnyTorqueLayer').and.returnValue(false);

    this.layerDefinitionModel = new Backbone.Model();

    this.modals = FactoryModals.createModalService();

    this.view = new StyleAnimatedPropertiesFormView({
      layerDefinitionsCollection: this.layerDefinitionsCollection,
      layerDefinitionModel: this.layerDefinitionModel,
      queryGeometryModel: this.queryGeometryModel,
      querySchemaModel: this.querySchemaModel,
      styleModel: this.styleModel,
      userModel: {
        featureEnabled: () => { return true; }
      },
      modals: this.modals
    });
    this.view._styleModel.set({type: 'animation'});

    this.view.render();
  });

  it('should not have leaks', () => {
    expect(this.view).toHaveNoLeaks();
  });
});
