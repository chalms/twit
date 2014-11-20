App.Views.Sidebar = Backbone.View.extend({
  id: '#sidebar',
  className: '.sidebar',
  tagName: 'div',

  events: {
    "click .icon":          "open",
  },

  initialize: function() {
    this.listenTo(this.model, "change", this.render);
  },
  render: function () {
    this.$el.html(this.template, this.model);
    return this;
  }
});