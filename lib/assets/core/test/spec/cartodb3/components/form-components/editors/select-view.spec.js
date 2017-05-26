var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

describe('components/form-components/editors/select', () => {
  var dispatchDocumentEvent = function (type, opts) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, false, true);
    if (opts.which) {
      e.which = opts.which;
    }
    document.dispatchEvent(e, opts);
  };

  var createViewFn = function (options) {
    var model = new Backbone.Model({
      names: 'pepe',
      latitude: undefined
    });

    var defaultOptions = {
      key: 'names',
      schema: {
        options: ['pepe', 'paco', 'juan']
      },
      model: model
    };

    var view = new Backbone.Form.editors.Select(_.extend(defaultOptions, options));
    view.render();
    return view;
  };

  beforeEach(() => {
    this.createView = createViewFn.bind(this);
  });

  it('should genereate an options collection', () => {
    var view = this.createView();

    expect(view.collection).toBeDefined();
    expect(view.collection.size()).toBe(3);

    view.remove();
  });

  describe('render', () => {
    it('should render properly', () => {
      var view = this.createView();

      expect(view.$('.js-button').length).toBe(1);
      expect(view.$('.js-button').text()).toContain('pepe');

      view.remove();
    });

    it('should render custom placeholder if provided', () => {
      var view = this.createView({
        placeholder: 'quinoa',
        keyAttr: 'latitude'
      });

      expect(view.$('.js-button').length).toBe(1);
      expect(view.$('.js-button').text()).toContain('quinoa');

      view.remove();
    });

    it('should pass  searchPlaceholder to CustomListView if present', () => {
      var text = 'Search Machine';
      var view = this.createView({
        searchPlaceholder: text
      });

      expect(view._listView.options.searchPlaceholder).toEqual(text);

      view.remove();
    });

    it('should disable the component if option is true', () => {
      var view = this.createView();

      view.options.disabled = true;
      spyOn(view, 'undelegateEvents').and.callThrough();
      view._initViews();
      expect(view.$('.js-button').hasClass('is-disabled')).toBeTruthy();
      expect(view.undelegateEvents).toHaveBeenCalled();

      view.remove();
    });

    it('should add is-empty class if there is no value selected', () => {
      var view = this.createView();

      view.model.set('names', '');
      view._initViews();
      expect(view.$('.js-button').hasClass('is-empty')).toBeTruthy();

      view.remove();
    });
  });

  describe('bindings', () => {
    beforeEach(() => {
      this.view = this.createView();
      spyOn(this.view._listView, 'hide');
    });

    it('should close list view if ESC is pressed', () => {
      dispatchDocumentEvent('keydown', { which: 27 });
      expect(this.view._listView.hide).toHaveBeenCalled();
    });

    it('should close list view if user clicks out the select', () => {
      dispatchDocumentEvent('click', { target: 'body' });
      expect(this.view._listView.hide).toHaveBeenCalled();
    });

    afterEach(() => {
      this.view.remove();
    });
  });

  describe('on ENTER pressed', () => {
    beforeEach(() => {
      this.view = this.createView();
      spyOn(this.view._listView, 'toggle');
      this._event = $.Event('keydown');
      this._event.which = 13;
    });

    it('should open custom list', () => {
      this.view.$('.js-button').trigger(this._event);
      expect(this.view._listView.toggle).toHaveBeenCalled();
    });

    it('should not open custom list if it is already visible', () => {
      this.view._listView.show();
      this.view.$('.js-button').trigger(this._event);
      expect(this.view._listView.toggle).not.toHaveBeenCalled();
    });

    afterEach(() => {
      this.view.remove();
    });
  });

  it('should change button value and hide list when a new item is selected', () => {
    var view = this.createView();
    spyOn(view._listView, 'hide');
    var mdl = view.collection.where({ val: 'juan' });
    mdl[0].set('selected', true);
    expect(view.$('.js-button').text()).toContain('juan');
    expect(view.$('.js-button').hasClass('is-empty')).toBeFalsy();
    expect(view._listView.hide).toHaveBeenCalled();
  });

  it('should open list view if "button" is clicked', () => {
    var view = this.createView();
    spyOn(view._listView, 'toggle');
    view.$('.js-button').trigger('click');
    expect(view._listView.toggle).toHaveBeenCalled();
  });

  it('should destroy custom list when element is removed', () => {
    var view = this.createView();
    spyOn(view._listView, 'clean');
    view.remove();
    expect(view._listView.clean).toHaveBeenCalled();
  });
});
