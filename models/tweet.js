var mongo = require('mongodb').MongoClient;
var Connection = require('./connection.js');
var colors = require('colors');
var User = require('./user.js');

var Tweet = function (json) {

  this.model: {
    id: '',
    id_str: "",
    url: "",
    created_at: new Date()
  };

  if (!this.valid) throw "Tweet non-valid error!";

  return this.model;
}

Tweet.prototype.valid = function (json) {
  return ((json['id']) || (json['id_str']) || (json["url"]));
}

Tweet.prototype.nature = function () {

}

Tweet.prototype.workout = function (workout, callback) {
  var v = false;
  for (var key in workout) {
    if (this.model.hasOwnProperty(key) && (key !== 'created at')) {
      v = true;
      this.model[key] = workout[key];
    }
  }
  if (!this.valid(this.model)) {
    throw "Tweet non-valid error!";
  } else {
    this.model[key] = workout[key];
  }
  callback();
}

