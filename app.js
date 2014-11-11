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
var  _ = require('lodash');
//var tweetSchema = require('./tweets.js');
//var twitter = new Twit(config);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var twit = new Twit(config);

var debug = require('./util/debug.js');
debug.out = ['red','green'];

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


apis = {
  twit: function (query, cb) {
    debug.yellow('twit =>');
    debug.cyan({ q: query.q });
    twit.get('search/tweets', { q: query.q }, function (err, tweets) {
      if (err) {
        debug.red(err);
        cb(err, undefined);
      } else if (tweets) {
          debug.yellow("Tweets => ");
          debug.yellow(_.keys(tweets));
          cb(undefined, tweets);
      } else {
        debug.red("API response is undefined");
        cb(undefined, undefined);
      }
    });
  }
}

app.use(express.static(__dirname + '/public'));
// var User = require('./models/user.js');
// var user = new User(collectionName);
app.set('view engine', 'jade');
app.use('/', index);


var nug = this;
var usernames = {};
var numUsers = 0;


mongoose.connect('mongodb://localhost/test_dev', function(err) {
io.on('connection', function (socket) {
  var addedUser = false;

  socket.models = {};

  //
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {

      var models = require('./models/exports.js');

      var Tweet = models.Tweet;
      var TweetUser = models.TweetUser;
      var Query = models.Query;
      var User = models.User;

      var exterior = this;
      exterior.Query = Query;
      exterior.Tweet = Tweet;

      function cBack(result) {
        console.log(result);
        qWrite('user', socket.user )
      }


      function userSetup(cb) {
        debug.yellow('userSetup =>');
        socket.models.user = User.findOne({ name: 'Janice', password: 'Twitter'});
        if (!(socket.models.user)) {
          debug.red('No User object!');
          throw err;
        }
        socket.models.user.queries = socket.models.user.queries ? socket.models.user.queries : new Array();
        cb();
      }

      function deleteId(obj, cb) {
        debug.yellow('deleteId =>');
        if (obj.model.hasOwnProperty('_id')) {
          delete obj.model._id;
          return cb(undefined, obj);
        } else {
          return cb(undefined, obj);
        }
      }

      function toObj(obj, cb) {
        debug.yellow('toObj =>');
        if (err) cb(err, undefined);
        if (obj.model.constructor.name === 'model') {
          obj.model = obj.model.toObject();
          deleteId(obj, cb);
        } else {
          deleteId(obj, cb);
        }
      }

      function setupQuery(query, cb) {
        debug.yellow('setup Query =>');

        function getQueryObject(queryMongoose, cb) {
          debug.yellow('getQueryObject =>');
          cb(queryMongoose.toObject());
        }

        function remove_id(queryObj, cb) {
          debug.yellow('remove_id =>');
          delete queryObj._id;
          cb(queryObj);
        }


        getQueryObject(query, function (queryObj) {
          debug.yellow('getQueryObject.callback =>')
          debug.green(queryObj);
          upsert({model: queryObj, modelClass: Query}, cb);
        });
      }

      function checkId(model, cb) {
        if (!(model)) {
          debug.red('model does not exist!');
        } else if (model._id) {
          debug.green('model has _id');
        } else {
          debug.cyan(model);
        }
        cb(model);
      }

      function setup(queryData, callback) {
        debug.yellow('setup =>');
        socket.models.query = queryData;
        setup = locks.createSemaphore(2);

        userSetup(function () {
          debug.yellow('userSetup.callback =>');
          setup.signal();
        });

        setupQuery(queryData, function (err, queryData) {
          debug.yellow('setupQuery.callback =>');
          if (err) {
            debug.red("Set Query => error");
            debug.red(err);
            throw (err);
          } else {
            socket.models.query = queryData;
            setup.signal();
          }
        });

        setup.wait(function () {
          debug.yellow('setup.wait.callback =>');
          callback();
        });
      }

      function replaceQuery(queryDoc, user, cb) {
        debug.yellow('replaceQuery =>');
        socket.models.query = queryDoc;
        cb(socket.models.query, user);
      }

      function saveQuery(query, cb) {
        debug.yellow('saveQuery =>');
        query.save(function (err) {
          debug.green(query);
          if (err) cb(err, undefined);
          if (!(query._id)) throw "Query has no ObjectID";
          cb(undefined, query);
        });
      }

      function saveUser(user, cb) {
        debug.yellow('saveUser =>');
        user.save(function (err, userDoc) {
          if (err) {
            socket.emit('error', err);
            return;
          } else if (user) {
            socket.emit('done', user);
            cb(undefined, user);
          } else {
            socket.emit('error', "No user can be saved!");
            cb(undefined, user);
          }
        });
      }

      function find(model, modelClass, cb, cb1) {
        debug.yellow('find =>');
        debug.cyan('model: ' + JSON.stringify(model) + '\nmodelClass: ' + modelClass);
        return modelClass.find(model, function(err, dbModel) {
          if (err) {
              return cb(err, undefined);
          } else if (dbModel) {
              return cb(undefined, dbModel);
          } else if (cb1) {
              return cb1();
          } else {
              return cb(undefined, undefined);
          }
        });
      }

      function save(model, modelClass, cb) {
        debug.yellow('save =>');
        debug.cyan('model: ' + JSON.stringify(model) + '\nmodelClass: ' + modelClass);
        if (!(model._id)) {
          model.save(model, function (err) {
            if (err) return cb(err, undefined);
            return cb(undefined, model);
          });
        }
      }

      function upsert(obj, cb) {
        debug.yellow('upsert =>');
        debug.cyan(obj);
        toObj(obj, function (err, model) {
          if (err) return cb(err, undefined);
          find(model, obj.modelClass, cb, function (model) {
            save(model, obj.modelClass, cb);
          });
        });

      }

      setup(new Query({q: data}), function (err) {
        debug.yellow('setup.callback =>');

        if (err) {
          debug.red(err);
          throw err;
        }

        socket.models.user.queries.push(socket.models.query._id);
        replaceQuery(socket.models.query, socket.models.user, function (query, user) {

          debug.yellow('replaceQuery.callback =>');

          socket.models.query = query;

          function getData(args) {
            debug.yellow('getData =>');
            apis[args.service](args.query, function (err, data) {
              debug.yellow('getData.callback =>');
              debug.cyan(data);

              if (err) {
                debug.red(err);
                args.done(err);
              }

              args.rawCollection = data["statuses"];
              return args.pipeline(args);
            });
          }

          getData({

            query: query,
            service: 'twit',
            socket: socket,
            socketPath: 'tweet',
            modelClass: exterior.Tweet,
            collection: query.tweets,

            addSemaphore: function (cb) {
              debug.yellow('addSemaphore =>');
              debug.green(this.rawCollection.length);
              this.sem = this.sem ? this.sem : locks.createSemaphore(this.rawCollection.length);
              this.sem.wait(cb);
            },

            pipelineError: function (str, data) {
              debug.yellow('pipelineError => ');
              debug.red("Function: " + str + "\nArguments: " + JSON.stringify(data));
              socket.emit(str, data);
            },

            eachItem: function(args, cb) {
              debug.yellow('eachItem =>');
              try {
                  checkId((new args.modelClass(args.rawData)), function (model) {
                      args.socket.emit(args.socketPath, model);
                      cb(undefined, model);
                  });
              } catch (err) {
                return args.pipelineError(err, args.rawData); }
            },

            pipeline: function (args) {
              //debug.cyan(args);
              debug.yellow('Pipeline => ');

              args.addSemaphore(function () {
                debug.yellow('addSemaphore.callback =>');
                upsert({
                  model: args.query,
                  modelClass: Query
                }, function (err, user) {
                  debug.yellow('upsert.callback =>');
                  args.done(err);
                });
              });

              for (var i = 0; i < args.rawCollection.length; i++) {
                args.rawData = args.rawCollection[i];
                args.eachItem(args, function (err, model) {
                  debug.yellow('eachItem.callback =>');
                  args.collection.push(model._id);
                  args.sem.signal();
                });
              }
            },

            done: function (err) {
              debug.yellow('done =>');
              if (err) {
                debug.red(err);
                socket.emit('error', err);
              }
              return socket.emit('done');
            }
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

  // socket.on('login', function (username) {
  //   console.log("Login: => \n\t");
  //   console.log(username);
  //   // var username = signupData.name;
  //   // try {
  //   //   socket.user =  new User({ username: username });
  //   // } catch (err) {
  //   //   console.log(colors.red(err.toString()));
  //   // }

  //   if (socket.user) {
  //     socket.username = username;
  //     // add the client's username to the global list
  //     usernames[username] = username;
  //     ++numUsers;
  //     addedUser = true;
  //     socket.emit('user', socket.user);
  //   } else {
  //     socket.emit('error', "Signup did not work!");
  //   }
  // })

  // // when the client emits 'add user', this listens and executes
  // socket.on('request login', function (username) {
  //   console.log(colors.yellow("Add User => "));
  //   console.log(colors.yellow(("\t" + JSON.stringify(username))));
  //   // we store the username in the socket session for this client
  //   if (username.hasOwnProperty('username')) {

  //     socket.emit('user', { name: "JOHNO", queries: []})

  //   } else {
  //     socket.emit('login', {
  //       username: "<name>",
  //       password: "<password>"
  //     });
  //   }
  // });


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

    // console.log(colors.yellow("Add User => "));
    // console.log(username);

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

});
