
var mongo = require('mongodb').MongoClient;
var Connection = require('./connection.js');
var colors = require('colors');
var User = require('./user.js');

module.exports = function (name, callback) {
  new Connection(name, function (collection, done) {
    collection.findOne(name, function (err, data) {
      if (data){
        var newErr = { error: "Cannot find entry in table!" };
        var jsonError = JSON.stringify(newErr);
        callback(jsonError);
        done();
      } else {
        var doc = data;
        var docString = JSON.stringify(doc);
        callback(docString);
        done();
      }
    });
  });
}


