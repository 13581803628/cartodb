var $ = require('jquery');
var Backbone = require('backbone');

var dispatchDocumentEvent = function (type, opts) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, false, true);
  if (opts.which) {
    e.which = opts.which;
  }
  document.dispatchEvent(e, opts);
};

describe('components/form-components/operators/operators-view', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      currency: {
        operator: 'count',
        attribute: ''
      }
    });

    this.view = new Backbone.Form.editors.Operators({
      key: 'currency',
      schema: {
        options: ['$', '€', '¥']
      },
      model: this.model
    });
    this.view.render();
    this.listView = this.view._operatorsListView;
  });

  it('should genereate an options collection', () => {
    expect(this.view.collection).toBeDefined();
    expect(this.view.collection.size()).toBe(3);
  });

  describe('render', () => {
    it('should render properly', () => {
      expect(this.view.$('.js-operator').length).toBe(1);
      expect(this.view.$('.js-button').length).toBe(1);
      expect(this.view.$('.js-button').text().toLowerCase()).toContain('count');
    });

    it('should disable the component if option is true', () => {
      this.view.options.disabled = true;
      spyOn(this.view, 'undelegateEvents').and.callThrough();
      this.view._initViews();
      expect(this.view.$('.js-button').hasClass('is-disabled')).toBeTruthy();
      expect(this.view.undelegateEvents).toHaveBeenCalled();
    });

    it('should add is-empty class if there is no value selected', () => {
      this.model.set('currency', '');
      this.view._initViews();
      expect(this.view.$('.js-button').hasClass('is-empty')).toBeTruthy();
    });
  });

  describe('bindings', () => {
    beforeEach(() => {
      spyOn(this.listView, 'hide');
    });

    it('should close list view if ESC is pressed', () => {
      dispatchDocumentEvent('keydown', { which: 27 });
      expect(this.listView.hide).toHaveBeenCalled();
    });

    it('should close list view if user clicks out the select', () => {
      dispatchDocumentEvent('click', { target: 'body' });
      expect(this.listView.hide).toHaveBeenCalled();
    });
  });

  describe('on ENTER pressed', () => {
    beforeEach(() => {
      spyOn(this.listView, 'toggle');
      this._event = $.Event('keydown');
      this._event.which = 13;
    });

    it('should open custom list', () => {
      this.view.$('.js-button').trigger(this._event);
      expect(this.listView.toggle).toHaveBeenCalled();
    });

    it('should not open custom list if it is already visible', () => {
      this.listView.show();
      this.view.$('.js-button').trigger(this._event);
      expect(this.listView.toggle).not.toHaveBeenCalled();
    });
  });

  it('should change button value when a new values are selected', () => {
    var values = {
      operator: 'sum',
      attribute: '¥'
    };
    this.listView.trigger('change', values);
    expect(this.view.$('.js-button').text().toLowerCase()).toContain('sum(¥)');
    expect(this.view.$('.js-button').hasClass('is-empty')).toBeFalsy();
  });

  it('should open list view if "button" is clicked', () => {
    spyOn(this.listView, 'toggle');
    this.view.$('.js-button').trigger('click');
    expect(this.listView.toggle).toHaveBeenCalled();
  });

  it('should destroy custom list when element is removed', () => {
    spyOn(this.listView, 'clean');
    this.view.remove();
    expect(this.listView.clean).toHaveBeenCalled();
  });

  afterEach(() => {
    this.view.remove();
    this.listView.remove();
  });
});
