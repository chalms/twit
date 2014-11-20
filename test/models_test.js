var assert = require("assert");
var colors = require('colors');
var expect = require('expect.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mongoose = mongoose.Mongoose;
var myMongoose = new Mongoose();


var nug = this;
myMongoose.connect('mongodb://localhost:27017/test_dev');

describe("Testing all classes", function (done) {



  beforeEach(function (done) {
      var models = require('../models/exports.js');
      var User = models.User
      , Tweet = models.Tweet
      , TweetUser = models.TweetUser
      , Query = models.Query;
    // User.remove({}, function (err) {
    //   if (err) {
    //     console.log.call(nug, "Error in BeforeEach");
    //     console.log.call(nug, err);
    //   }
    // });
    done();
  });


  it('Should save a new user', function (done) {
    var user = new User({ name: 'Andrew', password: 'password'});
    user.save(user, function (err) {
      if (err) {
        console.log.call(nug, err);
        done(err);
      }
      expect(model).to.eql(user);
      done();
    });
  });

  it('Should not save a duplicate', function (done) {
    function thrower (val) {
      var user, user2;
      try {
        user = new User({ name: 'Andrew', password: 'password'});
        user2 = new User({ name: 'Andrew', password: 'password' });
      } catch (err) {
        console.log.call(nug, err);
        return val(1);
      }
      user.save(function (err3, m) {
        if (err3) return val(1);
        user2.save(function (err2, m1) {
          if (err2) return val(1);
          val(2);
        });
      });
    }
    thrower(function (v) {
      expect(v).to.eql(1);
    });
    done();
  });

  it('Should throw an error', function (done) {
    function thrower (val) {
      var user, query;
      try {

        user = new User({ name: 'Andrew', password: 'password'});
        query1 = new Query({ q: 'GOOG'});

        user.queries.push(new Query({ q: 'GooGl'}));
        user.queries.push(query1.ObjectId);

        var tweet1 = new Tweet({ id: 123, user_id: 123432});
        tweet1.save(function (err, data) {
          if (err) done(err);
          query.tweets.push(data.ObjectId);
          var tweet2 = new Tweet({ id: 123, user_id: 123432})
          query.tweets.push(tweet2.ObjectId);
          tweet2.save(function (err, model) {
            if (err) done(err);
          });
        });


      } catch (err) {
        console.log.call(nug, err);
        return val(1);
      }
      user.save(function (err3, m) {
        if (err3) return val(1);
        user2.save(function (err2, m1) {
          if (err2) return val(1);
          val(2);
        });
      });
    }
    thrower(function (v) {
      expect(v).to.eql(1);
    });
    done();
  });
});

  //     console.log(colors.yellow('this fires after the post hook'));

  //     console.log(user);
  //     var id = user.id;
  //     console.log(id);
  //     var q = User.where({ _id: id});
  //     console.log(q);
  //     q.find(function (err, doc) {
  //       console.log(colors.yellow("Inside count!"));
  //       if (!(err)) {
  //         expect(count).to.eql(1);
  //         done();
  //       } else {
  //         done();
  //       }
  //     });
  //   });

  // });

  // it('Should raise an exception on duplicate users', function (done) {
  //   var user1 = new User({ name: 'Andrew' });
  //   User.find(user1).count(function (err, count) {
  //     function thrower(err) {
  //       console.log(err);
  //       var user2 = new User({ name: 'Andrew' });
  //       if (user2) {
  //         throw (new Error());
  //       }
  //     }
  //     expect(thrower(err)).to.not.throw(new Error());
  //     done();
  //   });
  // });

  // it('Should not count duplicate users', function (done) {
  //    var user1, user2;
  //   try {
  //     user1 = new User({ name: 'Andrew' });
  //     user2 = new User({ name: 'Andrew' });
  //   } catch (err) {
  //     User.model.find().count(function (err, count) {
  //       expect(count).to.eql(1);
  //       done();
  //     });
  //   }
  // });

  // it('Should count no0n-duplicate users', function (done) {
  //  var user1, user2;
  //   user1 = new User({ name: 'Andrew' });
  //   user2 = new User({ name: 'Marcus' });
  //   User.find().count(function (err, count) {
  //     expect(count).to.eql(2);
  //     done();
  //   });
  // });
// });