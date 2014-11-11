
colors = require('colors');
_ = require('lodash');

module.exports = _.transform({
  red: colors.red,
  blue: colors.blue,
  green: colors.green,
  cyan: colors.cyan,
  yellow: colors.yellow
}, function (result, color, key) {
  result[key] = function (message) {
    if (result.value) {
      if (typeof message === 'string') return console.log(color(message));
      if (typeof message === 'object') return console.log(color(JSON.stringify(message)));
    }
  }
});


