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


  var usernames = {};
  var numUsers = 0;

  io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {

      mongoose.connect('mongodb://localhost/test_dev', function(err) {

        var query = new Query({q: data});
        socket.user = new User({ name: 'Janice', password: 'Twitter'});

        socket.emit('query', query);

        socket.user.queries = socket.user.queries ? socket.user.queries : new Array();
        socket.user.queries.push(query);


        function qWrite(str, data) {
          console.log(data);
          console.log(str);
          console.log("Query => " + str);
          socket.emit(str, data);
        }

        function cBack(result) {
          console.log(result);
          qWrite('user', socket.user )
        }


        console.log("Query:");
        console.log(query);

        twit.get('search/tweets', { q: query.q }, function (err, data) {
          if (err) {
            console.log(err);
              qWrite('error', "Error retrieving tweets!");
            } else {
              if (typeof data === 'string') {
                throw "Is a string!";
              } else {
                console.log(data);
                var sem = locks.createSemaphore(data["statuses"].length);

                for (var i = 0; i < data["statuses"].length; i++) {
                  try {
                    var tweet = new Tweet(data["statuses"][i]);
                    if (!(query.tweets)) {
                      query.tweets = new Array();
                    }
                    query.tweets.push(tweet.ObjectId);
                    socket.user.queries.push(query);
                    socket.user.save(function (err, data) {
                      if (err) console.log(err);
                      if (data) {
                        socket.emit('tweet', data);
                      }
                    });
                    sem.signal();
                  } catch (err) {
                    qWrite('error', "Caught an exception!");
                    console.log(err);
                    done("Caught an exception!", null);
                  }
                };

                sem.wait(function () {
                  socket.emit('done!');
                });
              }
            }
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
