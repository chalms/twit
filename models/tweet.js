var mongoose = require('mongoose');
// Mongoose = mongoose.Mongoose;
// var myMongoose = new Mongoose();
// myMongoose.connect('mongodb://localhost/test');
var Schema = mongoose.Schema;
var MongooseSchemas = require('./mongoose/exports.js');
var Tweet = mongoose.model('Tweet', MongooseSchemas.TweetSchema);
module.exports = {
  Tweet: Tweet
}