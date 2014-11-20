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
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var twit = new Twit(config);
var debug = require('./util/debug.js');
debug.out = ['red'];
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
var apis = require('./apis.js');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');
app.use('/', index);
var nug = this;
var usernames = {};
var numUsers = 0;
var firstSocket = false;
var count = 0;
mongoose.connect('mongodb://localhost/test_dev', function(err) {
  var models = require('./models/exports.js');
  var Tweet = models.Tweet;
  var TweetUser = models.TweetUser;
  var Query = models.Query;
  var User = models.User;
  var exterior = this;
  exterior.Query = Query;
  exterior.Tweet = Tweet;
  var database = require('./twit_db.js');
  database(function (db) {
    io.on('connection', function (socket) {
      var addedUser = false;
      if (firstSocket === false) firstSocket = socket;
      socket.models = {};
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
      function setup(queryData, callback) {
        debug.yellow('setup =>');
        socket.models.query = queryData;
        setup = locks.createSemaphore(2);
        userSetup(function () {
          debug.yellow('userSetup.callback =>');
          setup.signal();
        });
        db.setupQuery(queryData, function (err, queryData) {
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
      function replaceQuery (queryDoc, user, cb) {
        debug.yellow('replaceQuery =>');
        socket.models.query = queryDoc;
        cb(socket.models.query, user);
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
      socket.on('new message', function (data) {
        var functions = {
          query: function (data) {
            setup(new Query({q: data}), function (err) {
              debug.yellow('setup.callback =>');
              if (err) { debug.red(err); throw err; }
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
                      return;
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
                        db.checkId((new args.modelClass(args.rawData)), function (model) {
                            args.socket.emit(args.socketPath, model);
                            args.socket.broadcast.emit('message', model);
                            cb(undefined, model);
                        });
                    } catch (err) {
                      return args.pipelineError(err, args.rawData);
                    }
                  },
                  pipeline: function (args) {
                    debug.yellow('Pipeline => ');
                    args.addSemaphore(function () {
                      debug.yellow('addSemaphore.callback =>');
                      db.upsert({
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
          }
        };
        if (data.indexOf("query:") > -1) {
          functions[data.split(':')[0]](data.split(':')[1]);
        } else {
          functions.query(data);
        }
      });
      var datahas = true;
      var addedUser = false;
      socket.on('score', function (data) {
        var vargs = {};
        vargs.socket = socket;
        vargs.data = data;
        console.log(colors.yellow("Score => "));
        debug.cyan(data);
        db.find({ _id: vargs.data._id}, Tweet, function (model, err) {
          if (err) {
            debug.red(err);
          } else {
            model.score = vargs.data.score;
            model.save(function (err) {
              if (err) {
                debug.red('Model.save error!');
                debug.red(err);
              } else {
                debug.cyan(model);
                vargs.socket.broadcast.emit('update', {
                   message: data
                });
              }
            })
          }
        });
      });
      socket.on('add user', function (username) {
        socket.username = username;
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
          numUsers: numUsers
        });
        socket.broadcast.emit('user joined', {
          username: socket.username,
          numUsers: numUsers
        });
      });
      socket.on('disconnect', function () {
        if (addedUser) {
          delete usernames[socket.username];
          --numUsers;
          socket.broadcast.emit('user left', {
            username: socket.username,
            numUsers: numUsers
          });
        }
      });
    });
  });
});
