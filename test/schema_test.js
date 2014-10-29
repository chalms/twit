var assert = require("assert");
var colors = require('colors');
var expect = require('expect.js');
var TweetSchema = require('../schemas/tweet_schema.js');
var TweetUserSchema = require('../schemas/tweet_user_schema.js');
var QuerySchema = require('../schemas/query_schema.js');
var UserSchema = require('../schemas/user_schema.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var sampleTweet = require('./tweet_fixture.js');

function closeThis() {
  mongoose.connection.close();
}

function f() {
  describe('Database setup', function () {

    var Tweet;
    describe('TweetSchema Module', function () {
      before(function () {
        Tweet = mongoose.model('Tweet', TweetSchema);
      });
      it ('should be an object', function (done) {
        assert.equal(Tweet.constructor.name, 'Function');
        done();
      });
    });

    describe('TweetSchema Module', function () {
      before(function () {
        TweetSchema.set('toJSON', { getters: true, virtuals: false });
        Tweet = mongoose.model('Tweet', TweetSchema);
      });
      it ('should create a tweet object', function (done) {

        sampleTweet["id"] = parseInt((Math.random() * 100000));
        sampleTweet["id_str"] = sampleTweet["id"] + '';

        var t = new Tweet(sampleTweet);
        console.log(colors.cyan(('id: ' + sampleTweet["id"])));
        console.log(colors.cyan(('id_str: ' + sampleTweet["id_str"])));

        t.save(function (err) {
          if (err) {
            console.log(err);

            console.log(colors.yellow("Duplicate!"));
            console.log(colors.cyan(doc));

            done();
            closeThis();

          } else {
            var query = Tweet.where({ id: sampleTweet["id"]});
            query.findOne(function (err, doc) {

              doc = doc["_doc"];
              console.log(colors.cyan("Document -> " + JSON.stringify(doc)));

              if (err) {

                console.log(colors.red(err));
                throw err;
              } else {
                console.log(colors.green("Test Result -> " + JSON.stringify(t)));
                expect(t.toObject()).to.eql(doc);
              }

              done();
              closeThis();
            });
          }
        });
      });
    });

    var TweetUser;
    describe('TweetUser Module', function () {
      before(function () {
        TweetUser = mongoose.model('TweetUser', TweetUserSchema);
      });
      it ('should be an object', function (done) {
        assert.equal(TweetUser.constructor.name, 'Function');
        done();
      });
    });

    var Query,  q;
    describe('Query Module', function () {
      before(function () {
        Query = mongoose.model('Query', QuerySchema);
        q = new Query({q: "Apples"});
      });
      it ('should be an object', function (done) {
        assert.equal(Query.constructor.name, 'Function');
        done();
      });
    });

    var User;
    describe('User Module', function () {
      before(function () {
        User = mongoose.model('User', UserSchema);
      });
      it ('should be an object', function (done) {
        assert.equal(User.constructor.name, 'Function');
        done();
      });
    });
  });
}



describe('DB Connection', function () {
  it('Should connect to db', function (done) {
    mongoose.connect('mongodb://localhost/test_dev', function(err) {
      expect(err).to.eql(undefined);
      done();
      f();
    });
  });
});



