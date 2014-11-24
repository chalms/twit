var debug = require('./util/debug.js');
debug.out = ['red','green', 'cyan'];
var config = require('./util/config1.js'); //for API Auth
var Twit = require('twit'); //for twitter api library
var colors = require('colors');  // to add color to your console.logs
var twit = new Twit(config);

module.exports = {
  twit: function (query, cb) {
    debug.yellow('twit =>');
    debug.cyan({ q: query.q });

    function getQuery(query) {
      var qu = { q: query.q };
      if (query.maxId) qu.max_id = query.maxId;
      return qu;
    }

    var result = getQuery(query);
    console.log(colors.red(JSON.stringify(result)));

    twit.get('search/tweets', result, function (err, tweets) {
      if (err) {
        debug.red(err);
        cb(err, undefined);
      } else if (tweets) {
          cb(undefined, tweets);
      } else {
        debug.red("API response is undefined");
        cb(undefined, undefined);
      }
    });
  },
  twitUser: function (id, cb) {
    debug.yellow('twit =>');

    twit.get('users/lookup', { user_id: id }, function (err, user) {
      if (err) {
        debug.red(err);
        cb(err, undefined);
      } else if (user) {
          cb(undefined, user);
      } else {
        debug.red("API response is undefined");
        cb(undefined, undefined);
      }
    });
  }
}