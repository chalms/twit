var colors = require('colors');
var User = require('./user.js');
var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MongooseSchemas = require('./mongoose/exports.js');
var Query = mongoose.model('Query', MongooseSchemas.QuerySchema);

// var QueryQueue = function () {
//   this.tweetQueue = [];
// };

// QueryQueue.prototype.lock = function (cb) {
//   if (this.tweetQueue.length > 0) {
//     cb(true);
//   } else {
//     cb(false);
//   }
// };

// QueryQueue.prototype.next = function(tweet) {
//   var _this = this;
//   this.lock(function (locked) {
//     _this.tweetQueue.pop().save(function (err, model) {
//       if (err) done(err);
//       this.user.queries.save(tweetId);
//       next();
//     });
//   });
// };

// QueryQueue.prototype.push = function(tweet) {
//   var _this = this;
//   this.lock(function (locked) {
//     _this.tweetQueue.push(tweet);
//     if (locked === false) _this.next();
//   });
// };

// _.extend(QueryQueue.prototype, Query)
// _.extend(QueryQueue, Query);

module.exports = Query;