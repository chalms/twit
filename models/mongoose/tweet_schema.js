var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function convert(val) {
  if (!val) throw "Not a valid id!";
  return parseInt(val);
}

var TweetSchema = new Schema({
  id: { type: Number, unique: true, sparse: true },
  id_str: { type: String, unique: true, sparse: true },
  created_at: { type: Date },
  updated_at: { type: Date, default: Date.now }
}, {
  strict: false
});

TweetSchema.pre('save', function (next) {
  if (!this.created_at) this.created_at = new Date();
  next();
});

module.exports = TweetSchema;