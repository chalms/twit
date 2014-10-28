var mongo = require('mongodb').MongoClient;
var Connection = require('./connection.js');
var colors = require('colors');
var User = require('./user.js');

var Query = function (str) {
  this.model: {
    query: str,
    tweets: [],
    min_id: undefined,
    max_id: undefined,
    created_at: new Date(),
  },
  return this.model;
};