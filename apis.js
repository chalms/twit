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