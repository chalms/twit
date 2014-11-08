var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var fs = require('fs'); // for read/write operations
var util = require('util'); // I forget
var config = require('./util/config1.js'); //for API Auth
var Twit = require('twit'); //for twitter api library
var colors = require('colors');  // to add color to your console.logs
var timeout = require('timeout'); //to change the timeouts for long
var errorHandler = require('errorhandler'); // to handle errors
var locks = require("locks");
var index = require('./routes/index.js');
var jade = require('jade'); // for jade templating
//var tweetSchema = require('./tweets.js');
//var twitter = new Twit(config);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var models = require('./models/exports.js');

var Tweet = models.Tweet;
var TweetUser = models.TweetUser;
var Query = models.Query;
var User = models.User;

var twit = new Twit(config);

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));
// var User = require('./models/user.js');
// var user = new User(collectionName);
app.set('view engine', 'jade');
app.use('/', index);

var nug = this;
var usernames = {};
var numUsers = 0;

function pipelineError(str, data) {
  console.log("Function => ");
  console.log(str);
  console.log("Arguements => ")
  console.log(data);
  socket.emit(str, data);
}

function cBack(result) {
  console.log(result);
  qWrite('user', socket.user )
}

apis = {
  twit: function (query, cb) {
    twit.get('search/tweets', { q: query.q }, function (err, tweets) {
      if (err)
          cb(err, undefined);
      else
          if tweets
              if (tweets.instanceof Object)
                  console.log.call(nug, "Tweets => ");
                  console.log.call(nug, _.keys(tweets));
          else
              console.log.call(nug, "Tweets is undefined");
          cb(undefined, tweets);
    });
  }
}

Object.prototype.addSemaphore = function (cb) {
  this.sem = this.sem ? this.sem : locks.createSemaphore(this.rawCollection.length);
  this.sem.wait(cb);
}

io.on('connection', function (socket) {
  var addedUser = false;

  socket.models = {};

  //
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {

    mongoose.connect('mongodb://localhost/test_dev', function(err) {


      function userSetup(cb) {
        socket.models.user = User.findOne({ name: 'Janice', password: 'Twitter'});
        if (!(socket.models.user)) {
          console.log.call(nug, "No User Object");
          throw err;
        }
        socket.models.user.queries = socket.models.user.queries ? socket.models.user.queries : new Array();
        cb();
      }

      function toObj(model, cb) {
        if (err) cb(err, undefined);
        var objModel = model.toObject();
        delete objModel._id;
        cb(undefined, objModel);
      }

      function setupQuery(query, cb) {
        function getQueryObject(queryMongoose, cb) {
          console.log.call(nug, "Query as Mongoose => ");
          console.log.call(nug, queryMongoose);
          cb(queryMongoose.toObject());
        }

        function remove_id(queryObj, cb) {
          console.log.call(nug, "Query as Object => ");
          console.log.call(nug, queryObj);
          delete queryObj._id;
          cb(queryObj);
        }


        getQueryObject(query, function (queryObj) {
          remove_id(queryObj, function (queryObject) {
            Query.findOne(queryObject, function (err, queryDoc) {
              if (err) {
                console.log.call(nug, "Error finding query!");
                console.log.call(nug, err.toString());
                throw err;
              }
              if (queryDoc) {
                console.log.call(nug, "Query Doc => ");
                console.log.call(nug, queryDoc);
                cb(undefined, queryDoc);
              } else {
                query.save(function (err) {
                  console.log.call(nug, "Query.save => ");
                  console.log.call(nug, query);
                  cb(err, query);
                });
              }
            });
          });
        });
      }

      function setup(queryData, callback) {
        socket.models.query = queryData;
        setup = locks.createSemaphore(2);

        userSetup(function () {
          setup.signal();
        });

        setupQuery(queryData, function (err, queryData) {
          if (err) {
            console.log.call(nug, "Set Query => error");
            console.log.call(nug, err.toString());
            throw (err);
          } else {
            socket.models.query = queryData;
            setup.signal();
          }
        });

        setup.wait(function () {
          callback();
        });
      }

      function replaceQuery(queryDoc, user, cb) {
        socket.models.query = queryDoc;
        console.log.call(nug, "Query:");
        console.log.call(nug, queryDoc);
        cb(socket.models.query, user);
      }

      function saveQuery(query, cb) {
        query.save(function (err) {
          console.log(query);
          console.log(query);
          if (err) cb(err, undefined);
          if (!(query._id)) throw "Query has no ObjectID";
          cb(undefined, query);
        });
      }

      function saveUser(user, cb) {
        user.save(function (err, userDoc) {
          if (err) {
            socket.emit('error', err);
            return;
          }
          if (user) {
            socket.emit('done', user);
            cb(undefined, user);
          } else {
            socket.emit('error', "No user can be saved!");
            cb(undefined, user);
          }
        });
      }

      function find(model, modelClass, cb, cb1) {
        return modelClass.find(model, function(err, dbModel) {
          if (err)
              return cb(err, undefined);
          else if (dbModel)
              return cb(undefined, dbModel);
          else
            if (cb1)
                return cb1(model);
            else
                return cb(undefined, undefined);
        });
      }

      function save(model, cb) {
        model.save(function (err) {
          if (err) return cb(err, undefined);
          return cb(undefined, model);
        });
      }

      function upsert(inputModel, modelClass, cb) {
        if (!(inputModel._id))
            return cb((new Error("NO ID IN UPSERT OF " + inputModel.toString())), undefined);
        else
            return toObj(inputModel, function (err, model) {
              if (err) return cb(err, undefined);
              return findModel(inputModel, modelClass, cb, function (model)) {
                return saveModel(model, cb);
              });
            });
      }

      setup(new Query({q: data}), function () {
        if (err)
            console.log.call(nug, err.toString());
            throw err;
        else
            socket.models.user.queries.push(socket.models.query._id);

        //
        // just log and query = queryDoc
        replaceQuery(socket.models.query, socket.models.user, function (query, user) {

          socket.models.query = query;
          // "Error retrieving tweets!"

          function getData(args) {
            apis[args.service](args.query, function (err, data) {
              if (err)
                  args.done(err);
              args.rawCollection = data;
              return args.pipeline(args);
            });
          }

          getData({

            query: query,
            service: 'twit',
            socket: socket,
            socketPath: 'tweets',
            modelClass: Tweet,
            collection: socket.user.queries,

            eachItem: function(args, cb) {
              try
                  args.checkId(new args.modelClass(args.rawData), function (model) {
                      args.socket.emit(args.socketPath, model);
                      cb(undefined, model);
                  }):
              catch err
                  return args.pipelineError(err, args.rawData);
            },

            pipeline: function (args) {

              args.addSemaphore(function () {
                dbConnect.save({
                  model: args.socket.models.query,
                  modelClass: args.Query
                }, function (err, user) {
                    args.done(err);
                });
              });

              for (var i = 0; i < args.rawCollection.length; i++)
                  args.rawData = args.rawCollection[i];
                  args.eachItem(args, function (err, model) {
                    args.collection.push(model._id);
                    args.sem.signal();
                  });

            },

            done: function (err) {
              if (err)
                  socket.emit('error', err);
              else
                  socket.emit('done');
            }
          });
        });
      });
    });
  });

  //   console.log(colors.yellow("Query: => "));
  //   console.log(query);
  //   socket.emit('running query', query.mask);
  //   query.save();
  // }
    // var query = socket.user.addQuery(input, function cb(d) { return d});
    // console.log(query);


  var datahas = true;

  socket.on('login', function (username) {
    console.log("Login: => \n\t");
    console.log(username);
    // var username = signupData.name;
    try {
      socket.user =  new User({ username: username });
    } catch (err) {
      console.log(colors.red(err.toString()));
    }

    if (socket.user) {
      socket.username = username;
      // add the client's username to the global list
      usernames[username] = username;
      ++numUsers;
      addedUser = true;
      socket.emit('user', socket.user);
    } else {
      socket.emit('error', "Signup did not work!");
    }
  })

  // when the client emits 'add user', this listens and executes
  socket.on('request login', function (username) {
    console.log(colors.yellow("Add User => "));
    console.log(colors.yellow(("\t" + JSON.stringify(username))));
    // we store the username in the socket session for this client
    if (username.hasOwnProperty('username')) {

      socket.emit('user', { name: "JOHNO", queries: []})

    } else {
      socket.emit('login', {
        username: "<name>",
        password: "<password>"
      });
    }
  });


  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  // socket.on('new message', function (data) {
  //   // we tell the client to execute 'new message'
  //   console.log(colors.yellow("New Message => "));
  //   console.log(data);

  //   socket.broadcast.emit('new message', {
  //     username: socket.username,
  //     message: data
  //   });
  // });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {

    console.log(colors.yellow("Add User => "));
    console.log(username);
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
