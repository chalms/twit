var mongo = require('mongodb').MongoClient;
var Connection = require('./connection.js');
var colors = require('colors');
var User = require('./user.js');
var allowUserNotFound = true;

var Users = function () {
  this.collection_name = "";
  this.connection = null;
}

Users.prototype.get = function (user_name, opts, callback) {
  this.connection = new Connection('user_db', function (collection, done) {

    console.log(colors.blue("Connection Created!"));
    console.log(collection);

    collection.findOne({ name: user_name }, function (err, doc) {

      function ome() {
        console.log(colors.red("Could not create the collection!"))
        callback({ error: "Collection could not be found!"});
        done();
      }

      if (err) throw err;
      if (!(doc)) {

        if (opts.hasOwnProperty('not_found')) {
          if (opts['not_found']) {
            ome();
          } else {

            var doc2Insert = { name: user_name, collection_name: ('collection_' + user_name)};

            var str = JSON.stringify(doc2Insert);
            console.log(colors.cyan(str));

            collection.insert(doc2Insert, { w: 1 }, function (err, doc) {
              if (err) throw err;
              if (!doc) {
                throw "Cannot create user!";
              } else {
                console.log("User created!");
                callback(doc);
                done();
              }
            });
          }

        } else {
          ome();
        }
      } else {
        ome();
      }
    });
  });
}

Users.prototype.set = function (collect_name, callback) {
  this.collection_name = collect_name;
  callback();
}

module.exports = Users;