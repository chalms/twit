var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var User = mongoose.model('User', {
  name: {type: String, index: { unique: true }},
  collection_name: { type: String, unique: true, sparse: true },
  updated: { type: Date, default: Date.now },
  queries: [],
  validate: [hasNumber, 'street number required']
});



module.exports = User;