var mongo = require('mongodb').MongoClient;
var url = "mongodb://Andrew:twitter@ds053469.mongolab.com:53469/tweets";
var colors = require('colors');
var Connection = require('./connection.js');
var colors = require('colors');
var User = require('./user.js');

module.exports = function (name, callback) {
  var collection = name;
  mongo.connect(url, function(err, db) {
    if (err) {
      throw err;
    } else {
      if (collection === null || collection === undefined) {
        throw (new Error("Cannot make collection!"));
      } else {
        try {
          collection = db.collection(name);
          console.log(colors.green("Calling callback!"));
          callback(collection, function (connection) { connection = null; });
        } catch (err) {
          try {
            db.createCollection(name);
            collection = db.collection(name);
            console.log(colors.green("Calling second callback!"));
            console.log(colors.green(collection));
            callback(collection, function (con) { con = null; });
          } catch (er) {
            console.log(colors.red("Cannot make connection!"))
            throw (new Error(er));
          }
        }
      }
    }
  });
};