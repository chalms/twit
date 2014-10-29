var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var UserCollection = mongoose.model('UserCollection', {
  name: {
    type: String,
    unique: true
  },
  collection_name: String
});

UserCollection