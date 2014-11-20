  App.Models.Sidebar = Backbone.Model.extend({
    id: '#sidebar',

    initialize: function () {
      this.set({color: 'black'});
    },

    events: this.on('change:color', function(model, color) {
      $('#sidebar').css({background: color});
    });
  });