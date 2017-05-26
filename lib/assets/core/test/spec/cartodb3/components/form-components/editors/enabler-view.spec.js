var Backbone = require('backbone');

describe('components/form-components/editors/enabler', () => {
  beforeEach(() => {
    this.model = new Backbone.Model({
      enabler: false
    });

    this.view = new Backbone.Form.editors.Enabler({
      model: this.model,
      title: 'hello',
      key: 'enabler'
    });
  });

  describe('render', () => {
    beforeEach(() => {
      this.view.render();
      this.$input = () => {
        return this.view.$('.js-input');
      };
    });

    it('should create the checkbox properly', () => {
      expect(this.$input().length).toBe(1);
      expect(this.$input().is(':checked')).toBeFalsy();
    });

    it('should start checked from the beginning if key is true', () => {
      this.model.attributes.enabler = true;
      var view = new Backbone.Form.editors.Enabler({
        model: this.model,
        title: 'hello',
        key: 'enabler'
      });
      expect(view.$('.js-input').is(':checked')).toBeTruthy();
    });

    it('should disable checkbox if option is false', () => {
      this.view.options.disabled = true;
      this.view._initViews();
      expect(this.$input().is(':checked')).toBeFalsy();
      expect(this.$input().is(':disabled')).toBeTruthy();
    });

    it('should add help and help tooltip', () => {
      this.view.options.help = 'help!';
      this.view._initViews();
      expect(this.view.$('.js-help').length).toBe(1);
      expect(this.view._helpTooltip).toBeDefined();
    });
  });

  it('should trigger event when input changes', () => {
    var bindSpy = jest.createSpy('callback');
    expect(this.model.get('enabler')).toBeFalsy();
    this.view.bind('change', bindSpy);
    this.view.$('.js-input').attr('checked', '').trigger('change');
    expect(this.model.get('enabler')).toBeTruthy();
    expect(bindSpy).toHaveBeenCalled();
  });

  it('should set value properly', () => {
    this.view.setValue(true);
    expect(this.model.get('enabler')).toBeTruthy();
    expect(this.view.$('.js-input').is(':checked')).toBeTruthy();
    this.view.setValue(false);
    expect(this.model.get('enabler')).toBeFalsy();
    expect(this.view.$('.js-input').is(':checked')).toBeFalsy();
  });

  it('should remove help tooltip if it is defined', () => {
    this.view.options.help = 'hello';
    this.view._initViews();
    spyOn(this.view, '_removeTooltip');
    this.view.remove();
    expect(this.view._removeTooltip).toHaveBeenCalled();
  });

  afterEach(() => {
    this.view.remove();
  });
});
