var locks = require("locks");
var debug = require('../util/debug.js');
debug.out = ['red','green', 'cyan'];
var config = require('../util/config1.js'); //for API Auth
var Twit = require('twit'); //for twitter api library
var colors = require('colors');  // to add color to your console.logs
var twit = new Twit(config);
var User = require('../models/exports.js').User;

module.exports = (function (my, obj) {

  var socket, db;

  my.setParams = function (obj) {
    socket = obj.socket;
    db = obj.db;
  }

  my.userSetup = function(cb) {
    debug.yellow('userSetup =>');
    socket.models.user = User.findOne({ name: 'Janice', password: 'Twitter'});
    if (!(socket.models.user)) {
      debug.red('No User object!');
      throw err;
    }
    socket.models.user.queries = socket.models.user.queries ? socket.models.user.queries : new Array();
    cb();
  }

  var _my = my;
  my.setup = function(queryData, callback) {
    debug.yellow('setup =>');
    socket.models.query = queryData;
    setup = locks.createSemaphore(2);

    _my.userSetup(function () {
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


  my.replaceQuery = function(queryDoc, user, cb) {
    debug.yellow('replaceQuery =>');
    socket.models.query = queryDoc;
    cb(socket.models.query, user);
  }

  my.saveUser = function(user, cb) {
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
  return my;
}(module.exports));