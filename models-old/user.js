var mongo = require('mongodb').MongoClient;
var Connection = require('./connection.js');
var colors = require('colors');

var User = function (name, c_name) {
  this.model = {
    name: name,
    collection_name: c_name,
    queries: []
  };
  var the_name;
  if (name) {
    new Connection('user_db', function (collection) {
      doc = collection.findOne( { $or: [ { name: name }, { collection_name: collection_name }]});
      the_name = tojson(doc).collection_name;
    });
  }
  the_name = c_name;
  if (the_name) {
    new Connection(the_name, function (collection) {
      // doc = collection.find({ query: }, { collection_name: collection_name }]});
      // this.model = tojson(doc);
    });
  }
}

User.prototype.getName = function (c_name, callback) {
  if (c_name === null || c_name === undefined || (!c_name)) {
    callback("collection_" + c_name);
  } else {
    callback(c_name);
  }
};

User.prototype.getQueries = function (callback) {
  var arr = [];
  for (var key in this.model.queries) {
    arr.push(key);
  }
  callback(arr);
};

User.prototype.setName =  function () {
_this = this;
  getName(_this.collection_name, function (collectionName) {
    _this.model.collection_name = collectionName;
    findTweets();
  });
}

User.prototype.name = function () {
  return name;
}

User.prototype.collection = function (name ) {
 collection.find({ name: user_name }, function (err, doc) {
    return doc;
  });
}

module.exports = User;