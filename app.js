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

function qWrite(str, data) {
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

      function getTweets(query, cb) {
        twit.get('search/tweets', { q: query.q }, function (err, tweets) {
          if (err) return qWrite('error', "Error retrieving tweets!");
          console.log("Tweets => ")
          console.log(tweets);
          cb(tweets);
        });
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

      function checkTweetId(tweetDoc, cb2) {
        if (!(tweetDoc._id)) throw "NO TWEET ID";
        cb2(tweetDoc);
      }

      function setupTweet(rawTweet, cb) {
        try {
          checkTweetId(new Tweet(rawTweet), function (tweetDoc) {
            socket.emit('tweet', tweetDoc);
            cb(undefined, tweetDoc);
          });
        } catch (err) {
          qWrite('error', err.toString());
          return ;
        }
      }

      setup(new Query({q: data}), function () {

        //
        // check that querydoc was saved properly and add its id to the users arr
        if (err) {
          console.log.call(nug, err.toString());
          throw err;
        }

        socket.models.user.queries.push(socket.models.query._id);

        //
        // just log and query = queryDoc
        replaceQuery(socket.models.query, socket.models.user, function (query, user) {

          socket.models.query = query;
          //
          // run the twit api and return the object
          getTweets(query, function (tweets) {

            //
            // create semaphore and other vars for context
            if (!(this.sem)) this.sem = locks.createSemaphore(tweets["statuses"].length);

            //
            // loop through tweets
            for (var i = 0; i < tweets["statuses"].length; i++) {

              //
              // log each tweet, output it, save it and then return it
              setupTweet(tweets["statuses"][i], function (err, tweetDoc) {

                //
                // add the tweet id to our query.tweets array
                socket.models.query.tweets.push(tweetDoc._id);

                // decrement the semaphore
                sem.signal();
              });
            };

            //
            // when the semaphore = 0 (so all tweets are saved), this executes
            sem.wait(function () {

              //
              // save the query object, check it has object id
              saveQuery(socket.models.query, function (err, query) {
                if (err) throw err;

                //
                // add the query id to the users document
                _this.user.queries.push(query._id);

                //
                // save the users document and output it over the wire
                saveUser(_this.user, function (err, userDoc) {

                  //
                  // call some next method?
                  done();
                });
              });
            });
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
