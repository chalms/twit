var mongo = require('mongodb').MongoClient;
var Connection = require('./connection.js');
var colors = require('colors');

var User = require('./user.js');

var TweetDatabase = function (name) {

  this.model: function (name) {
    name:  name,
    indexes: [{
        params: {"id":1},
        opts: { sparse: true, unique: true}
      },
      {
        params: {"id_str":1},
        opts: { sparse: true, unique: true}
      },
      {
        params: {"url":1},
        opts: { sparse: true, unique: true}
    }]
  },

  this.createCollection: function (schema, doneCreatingCollection) {
    mongo.connect(url, function(err, db) {

      if (err) {
        throw err;
      } else {

        function createIndexes(indexQueue, collection, done) {
          var nextIndex = indexQueue.pop();
          _this = this;
          _this.collection = collection;
          _this.collection.ensureIndex(nextIndex.params, nextIndex.opts, function (err, name) {
            if (err) {
              throw err;
            } else {
              if (queue.length > 0) {
                _this(indexQueue, _this.collection, done)
              } else {
                done(_this.collection);
              }
            }
          });
        }
        try {
          db.createCollection(name);
          var collection = db.collection(schema.name);

          createIndexes(schema.indexes, collection, function (collection) {
            doneCreatingCollection(collection)
          });
        } catch (err) {
          var collection = db.collection(schema.name);

          createIndexes(schema.indexes, collection, function (collection) {
            doneCreatingCollection(collection)
          });
        }
      }
    });
  },


  this.connect: function (name, cb) {
    mongo.connect(url, function(err, db) {
      if (err) {
        throw err;
      } else {
        var collection;
        if (collection === null || collection === undefined) {
          throw (new Error("Cannot make collection!"));
        } else {
          try {
            collection = db.collection(name);
            cb(name);
          } catch (err) {
            try {
              collection = db.createCollection(name);
              cb(name);
            } catch (er) {
              throw (new Error(er));
            }
          }
        }
      }
    });
  },

  this.fetch: function (data) {

    data = JSON.parse(data);
    console.log(JSON.stringify(data).cyan);
    var collection, query, twitJson;

    function emit(msg, json) {
      socket.broadcast.emit(msg, json);
    }

    function getQuery(data, collectionName, callback) {
      try {
        if (data.hasOwnProperty("search")) {
          query = data["search"];
          twitJsonObject = { q: query };
          callback(collectionName, twitJsonObject);
        } else {
          throw "Has no property 'Search'";
        }
      } catch (err) {
        emit('error', { username: socket.username, error: err.getMessage, status: 400});
      }
    }

    getCollection(data["collection"], function (err, collectionName) {
      if (err) {
        throw err
      } else {
        getQuery(data, collectionName, function (collecionName, twitJsonObject) {
          _this.twitter.get('search/tweets', twitJsonObject, function (err, tweets, serverResponseData) {
            console.log(("Sending Query: " + query).green);
            try {
              if (err === null && err === undefined) {
                emit('tweets', {
                  username: socket.username,
                  status: 200,
                  data: tweets
                });
                updateCollection(collectionName, tweets);
              } else {
                throw "The API did not respond!";
              }
            } catch (err) {
              console.log(err);
              emit('error', {
                username: socket.username,
                error: "The API did not respond!",
                status: 400
              });
              updateCollection(collectionName, tweets);
            }
          });
        });
      }
    });
  },


  this.updateCollection: function(collectionName, query, tweets, done) {
    mongo.connect(url, function(err, db) {
      if (err) {
        throw err;
      } else {
        createCollection(tweetSchema, function (tweetCollection) {
          try {
            var tweetUpdates = tweetCollection.initializeUnorderedBulkOp();
            var tweetIds = [];
            for (var i in tweets) {
              var elem = tweets[i];
              tweetUpdates.find({
                $or: [ {
                  "id": elem["id"]
                }, {
                  "id_str": elem["id_str"]
                } ]
              }).upsert().updateOne({ $set: elem });
              tweetIds.push(tweets[i]);
            }
            tweetUpdates.execute(function(err, result) {
              if (err) {
                throw err
              } else {
                createCollection(mySchema, function (queryCollection) {
                  var queries = queryCollection.initializeUnorderedBulkOp();
                  queries.find({
                    "query": query
                  }).upsert().update(tweetIds);
                  queries.execute(function(err, result) {
                    if (err) {
                      throw err
                    } else {
                      done();
                    }
                  });
                });
              }
              console.log("Tweets Updated!".green)
            });
          } catch (err) {
            console.log(err);
          }
        });
      }
    });
  }
}

module.exports = TweetDatabase;
