var _ = require('underscore');
var Backbone = require('backbone');
var ConfigModel = require('../../../../../../../javascripts/cartodb3/data/config-model');
var QuerySchemaModel = require('../../../../../../../javascripts/cartodb3/data/query-schema-model');
var QueryGeometryModel = require('../../../../../../../javascripts/cartodb3/data/query-geometry-model');
var SQLModel = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/data/data-sql-model');
var UserModel = require('../../../../../../../javascripts/cartodb3/data/user-model');
var VisDefinitionModel = require('../../../../../../../javascripts/cartodb3/data/vis-definition-model');
var Notifier = require('../../../../../../../javascripts/cartodb3/components/notifier/notifier.js');
var DataView = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/data/data-view');
var SQLNotifications = require('../../../../../../../javascripts/cartodb3/sql-notifications.js');
var UserNotifications = require('../../../../../../../javascripts/cartodb3/data/user-notifications');
var layerOnboardingKey = require('../../../../../../../javascripts/cartodb3/components/onboardings/layers/layer-onboarding-key');
var AnalysesService = require('../../../../../../../javascripts/cartodb3/editor/layers/layer-content-views/analyses/analyses-service');

describe('editor/layers/layers-content-view/data/data-view', function () {
  beforeEach(function () {
    jasmine.Ajax.install();

    this.sqlModel = new SQLModel({
      content: 'SELECT * FROM table'
    });

    this.configModel = new ConfigModel({
      sql_api_template: 'http://{user}.localhost.lan:8080',
      user_name: 'pepito',
      api_key: 'hello-apikey'
    });

    this.node = new Backbone.Model({
      type: 'source'
    });
    this.node.getDefaultQuery = function () {
      return 'SELECT * FROM table';
    };
    this.node.querySchemaModel = new QuerySchemaModel({
      query: 'SELECT * FROM table',
      status: 'fetched'
    }, {
      configModel: this.configModel
    });
    this.node.queryGeometryModel = new QueryGeometryModel({
      query: 'SELECT * FROM table',
      status: 'fetched',
      simple_geom: 'point'
    }, {
      configModel: this.configModel
    });
    this.stackLayoutModel = jasmine.createSpyObj('stackLayoutModel', ['goToStep']);

    this.layerDefinitionModel = new Backbone.Model({
      user_name: 'pepito'
    });
    this.layerDefinitionModel.getAnalysisDefinitionNodeModel = function () {
      return this.node;
    }.bind(this);
    this.layerDefinitionModel.getTableName = function () {
      return 'table';
    };
    this.layerDefinitionModel.canBeGeoreferenced = function () { return false; };
    this.layerDefinitionModel.toggleVisible = function () { };

    this.userModel = new UserModel({
      username: 'pepe'
    }, {
      configModel: this.configModel
    });

    this.layerDefinitionModel.sqlModel = this.sqlModel;

    this.editorModel = new Backbone.Model();
    this.editorModel.isEditing = function () { return false; };
    this.userActions = jasmine.createSpyObj('userActions', ['saveAnalysisSourceQuery', 'saveLayer']);

    this.visDefinitionModel = new VisDefinitionModel({
      name: 'Foo Map',
      privacy: 'PUBLIC',
      updated_at: '2016-06-21T15:30:06+00:00',
      type: 'derived'
    }, {
      configModel: this.configModel
    });

    Notifier.init({
      editorModel: this.editorModel,
      visDefinitionModel: this.visDefinitionModel
    });

    spyOn(SQLNotifications, 'showErrorNotification');
    spyOn(SQLNotifications, 'removeNotification');
    spyOn(SQLNotifications, '_addOrUpdateNotification');

    var onboardingNotification = new UserNotifications({}, {
      key: 'builder',
      configModel: this.configModel
    });

    this.view = new DataView({
      layerDefinitionModel: this.layerDefinitionModel,
      stackLayoutModel: this.stackLayoutModel,
      widgetDefinitionsCollection: new Backbone.Collection(),
      editorModel: this.editorModel,
      userModel: this.userModel,
      userActions: this.userActions,
      configModel: this.configModel,
      onboardings: {},
      onboardingNotification: onboardingNotification
    });

    spyOn(this.view._SQL, 'execute').and.callFake(function (query, vars, params) {
      params.success();
    });

    spyOn(this.view._onboardingLauncher, 'launch');

    this.view._widgetDefinitionsCollection.isThereTimeSeries = function () {
      return false;
    };
    spyOn(this.view, 'clean');
    this.view.render();
  });

  afterEach(function () {
    Notifier.off();
    jasmine.Ajax.uninstall();
  });

  it('should render properly', function () {
    expect(_.size(this.view._subviews)).toBe(1);
  });

  it('should create internal codemirror model', function () {
    expect(this.view._codemirrorModel).toBeDefined();
  });

  it('should create _onboardingNotification', function () {
    expect(this.view._onboardingNotification).not.toBe(null);
  });

  it('render should call _launchOnboarding', function () {
    spyOn(this.view, '_launchOnboarding');

    this.view.render();

    expect(this.view._launchOnboarding).toHaveBeenCalled();
  });

  describe('bindings', function () {
    it('should set codemirror value when query schema model changes', function () {
      spyOn(this.view._codemirrorModel, 'set');
      this.node.querySchemaModel.set('query_errors', ['Syntax error']);
      expect(this.view._codemirrorModel.set).toHaveBeenCalled();
    });

    it('should update codemirror if query schema model changes', function () {
      spyOn(this.view._codemirrorModel, 'set');
      this.view._querySchemaModel.set({query: 'SELECT * FROM table LIMIT 10'});
      expect(this.view._codemirrorModel.set).toHaveBeenCalled();
    });

    it('should set codemirror value when undo or redo is applied', function () {
      this.sqlModel.set('content', 'SELECT foo FROM table');
      spyOn(this.view._codemirrorModel, 'set');
      this.sqlModel.undo();
      expect(this.view._codemirrorModel.set).toHaveBeenCalled();
      this.view._codemirrorModel.set.calls.reset();
      this.sqlModel.redo();
      expect(this.view._codemirrorModel.set).toHaveBeenCalled();
    });

    it('should sync the query status with the apply button status', function () {
      this.view._querySchemaModel.set('status', 'fetching');
      expect(this.view._applyButtonStatusModel.get('loading')).toBe(true);

      this.view._querySchemaModel.set('status', 'fetched');
      expect(this.view._applyButtonStatusModel.get('loading')).toBe(false);

      this.view._querySchemaModel.set('status', 'unavailable');
      expect(this.view._applyButtonStatusModel.get('loading')).toBe(false);

      this.view._querySchemaModel.set('status', 'unfetched');
      expect(this.view._applyButtonStatusModel.get('loading')).toBe(false);
    });
  });

  it('should apply default query and refresh map and dataset view when query alters data', function () {
    jasmine.Ajax.stubRequest(new RegExp('^http(s)?.*'))
      .andReturn({ status: 200 });

    var originalQuery = 'SELECT * FROM table';
    spyOn(this.editorModel, 'isEditing').and.returnValue(true);
    spyOn(this.node.querySchemaModel, 'resetDueToAlteredData');
    this.view._codemirrorModel.set('content', 'DELETE FROM table WHERE cartodb_id=2');
    this.view._parseSQL();
    expect(this.view._codemirrorModel.get('content')).toBe(originalQuery);
    expect(this.userActions.saveAnalysisSourceQuery).toHaveBeenCalled();
    expect(this.node.querySchemaModel.get('query_errors').length).toBe(0);
    expect(this.node.querySchemaModel.get('query')).toBe(originalQuery);
    expect(this.node.querySchemaModel.resetDueToAlteredData).toHaveBeenCalled();
  });

  it('should fetch geometry when a new query is applied', function () {
    this.view._codemirrorModel.set('content', 'SELECT * FROM table LIMIT 10');
    spyOn(this.node.queryGeometryModel, 'fetch');
    spyOn(this.node.querySchemaModel, 'fetch');
    this.view._parseSQL();
    expect(this.node.queryGeometryModel.hasChanged('simple_geom')).toBeFalsy();
    expect(this.node.queryGeometryModel.get('query')).toBe('SELECT * FROM table LIMIT 10');
    expect(this.node.queryGeometryModel.fetch).toHaveBeenCalled();
  });

  it('should not let run the same query that is applied', function () {
    var originalQuery = 'SELECT * FROM table';
    spyOn(this.node.querySchemaModel, 'fetch');
    this.node.querySchemaModel.set('query', originalQuery);
    this.view._codemirrorModel.set('content', originalQuery);
    this.view._parseSQL();
    expect(this.node.querySchemaModel.fetch).not.toHaveBeenCalled();
    this.view._codemirrorModel.set('content', originalQuery.toUpperCase());
    this.view._parseSQL();
    expect(this.node.querySchemaModel.fetch).not.toHaveBeenCalled();
  });

  it('should not apply an empty query', function () {
    spyOn(this.node.querySchemaModel, 'fetch');
    this.view._codemirrorModel.set('content', '');
    this.view._parseSQL();
    expect(this.node.querySchemaModel.fetch).not.toHaveBeenCalled();
  });

  it('should not set a query with a ; character at the end', function () {
    spyOn(this.node.querySchemaModel, 'fetch');
    this.view._codemirrorModel.set('content', 'select * from whatever;');
    this.view._parseSQL();
    expect(this.view._codemirrorModel.get('content')).toBe('select * from whatever');
    expect(this.node.querySchemaModel.fetch).toHaveBeenCalled();

    this.view._codemirrorModel.set('content', 'select * from whatever; hello');
    this.view._parseSQL();
    expect(this.view._codemirrorModel.get('content')).toBe('select * from whatever; hello');
  });

  it('should not throw notification if same query that is applied', function () {
    SQLNotifications._addOrUpdateNotification.calls.reset();
    spyOn(this.node.querySchemaModel, 'fetch');
    this.view._sqlModel.set('content', 'SELECT * FROM table');
    this.view._codemirrorModel.set('content', 'SELECT * + FROM table');
    this.view._parseSQL();
    expect(this.node.querySchemaModel.fetch).toHaveBeenCalled();

    this.node.querySchemaModel.set('query', 'SELECT * FROM table');
    this.node.querySchemaModel.set('query_errors', ['Syntax error']);
    this.view._codemirrorModel.set('content', 'SELECT * FROM table');
    this.node.querySchemaModel.set('query_errors', []);
    this.view._parseSQL();

    expect(SQLNotifications.showErrorNotification).toHaveBeenCalledTimes(1);
    expect(SQLNotifications.removeNotification).toHaveBeenCalledTimes(1);
    expect(SQLNotifications._addOrUpdateNotification).toHaveBeenCalledTimes(1);
  });

  describe('_launchOnboarding', function () {
    it('should do nothing if onboarding was skipped', function () {
      this.view._onboardingNotification.setKey(layerOnboardingKey, true);
      this.view._onboardingLauncher.launch.calls.reset();

      this.view._launchOnboarding();

      expect(this.view._onboardingLauncher.launch).not.toHaveBeenCalled();
    });

    it('should do nothing if we are on editing mode', function () {
      this.view._onboardingNotification.setKey(layerOnboardingKey, false);
      this.view._editorModel.isEditing = function () { return true; };
      this.view._onboardingLauncher.launch.calls.reset();

      this.view._launchOnboarding();

      expect(this.view._onboardingLauncher.launch).not.toHaveBeenCalled();
    });

    it('should launch the onboarding', function () {
      this.view._onboardingNotification.setKey(layerOnboardingKey, false);
      this.view._editorModel.isEditing = function () { return false; };
      this.view._onboardingLauncher.launch.calls.reset();

      this.view._launchOnboarding();

      expect(this.view._onboardingLauncher.launch).toHaveBeenCalled();
    });
  });

  it('should not have leaks', function () {
    expect(this.view).toHaveNoLeaks();
  });

  describe('._infoboxState', function () {
    beforeEach(function () {
      this.view._infoboxModel.set('state', '');
      this.view._overlayModel.set('visible', false);
      this.view._editorModel.set('edition', false);
      this.view._codemirrorModel.set('readonly', false);
      spyOn(this.view, '_hasAnalysisApplied').and.returnValue(false);
      spyOn(this.view, '_isLayerHidden').and.returnValue(false);
      spyOn(this.view._layerDefinitionModel, 'canBeGeoreferenced').and.returnValue(false);
    });

    describe('if layer can be georeferenced', function () {
      it('should set infobox state', function () {
        this.view._layerDefinitionModel.canBeGeoreferenced.and.returnValue(true);

        this.view._infoboxState();

        expect(this.view._infoboxModel.get('state')).toBe('georeference');
        expect(this.view._overlayModel.get('visible')).toBe(false);
      });
    });

    describe('if layer is editing and has analysis', function () {
      it('should set infobox state', function () {
        this.view._editorModel.set('edition', true);
        this.view._hasAnalysisApplied.and.returnValue(true);

        this.view._infoboxState();

        expect(this.view._infoboxModel.get('state')).toBe('readonly');
        expect(this.view._codemirrorModel.get('readonly')).toBe(true);
      });
    });

    describe('if layer is not editing and is hidden', function () {
      it('should set infobox state', function () {
        this.view._isLayerHidden.and.returnValue(true);

        this.view._infoboxState();

        expect(this.view._infoboxModel.get('state')).toBe('layer-hidden');
        expect(this.view._overlayModel.get('visible')).toBe(true);
      });
    });

    it('should unset infobox state', function () {
      this.view._infoboxState();

      expect(this.view._infoboxModel.get('state')).toBe('');
      expect(this.view._overlayModel.get('visible')).toBe(false);
    });
  });

  describe('._showHiddenLayer', function () {
    it('should show layer if is visible', function () {
      spyOn(this.view._layerDefinitionModel, 'toggleVisible');

      this.view._showHiddenLayer();

      expect(this.view._layerDefinitionModel.toggleVisible).toHaveBeenCalled();
      expect(this.view._userActions.saveLayer).toHaveBeenCalledWith(this.view._layerDefinitionModel, { shouldPreserveAutoStyle: true });
    });
  });

  describe('._isLayerHidden', function () {
    it('should return true if layer is not visible', function () {
      this.view._layerDefinitionModel.set('visible', false);

      expect(this.view._isLayerHidden()).toBe(true);
    });
  });

  describe('._onGeoreferenceClicked', function () {
    it('should add Georeference Analysis', function () {
      spyOn(AnalysesService, 'addGeoreferenceAnalysis');

      this.view._onGeoreferenceClicked();

      expect(AnalysesService.addGeoreferenceAnalysis).toHaveBeenCalled();
    });
  });
});
