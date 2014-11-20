var mongoose = require('mongoose');
var Schema = mongoose.Schema;
TweetSchema = require('./tweet_schema.js');

QuerySchema = new Schema({
  q: { type: String, index: { unique: true }},
  tweets: [TweetSchema.ObjectId],
  updated_at: { type: Date, default: Date.now },
  created_at: Date,
  maxId: { type: Number, max: true },
  minId: { type: Number, min: true }
});

QuerySchema.index({ q: true });

QuerySchema.pre('save', function (next) {
  if (!this.created_at) this.created_at = new Date();
  next();
});


module.exports = QuerySchema;


