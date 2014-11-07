var mongoose = require('mongoose');
var Schema = mongoose.Schema;
TweetSchema = require('./tweet_schema.js');

TweetUserSchema = new Schema({
  user_id: { type: Number, unique: true, sparse: true },
  influence: Number,
  tweets: [TweetSchema.ObjectId],
  created_at: Date,
  updated_at: { type: Date, default: Date.now}
}, { strict: false });


TweetSchema.pre('save', function (next) {
  if (!this.created_at) this.created_at = new Date();
  next();
});


module.exports = TweetUserSchema;