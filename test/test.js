var assert = require("assert");
var Users = require('../models/users.js');
var User = require('../models/user.js');
var colors = require('colors');
var expect = require('expect.js');
var users = new Users();
var mongo = require('mocha-mongo')('mongodb://localhost');
var url = "mongodb://Andrew:twitter@ds053469.mongolab.com:53469/tweets";
var UserCollection = require('../models/user_collection.js');

var ready, name, clean, db;

describe('setup database and random name', function () {
  before(function () {
    ready = mongo.ready();
    name = Math.random().toString(36).substring(7);
    collection_name = ("collection_" + name);
  });

  after(function () {
    describe('Can insert documents into database', function () {
      before(function () {
        clean = mongo.cleanCollections(['user_db']);
      });
      it('should be able to insert into the database', function () {
        function c(cb) {
          ready(function (db, done) {
            db.collection('user_db').insert({ name: name, collection_name: collection_name}, done)
          });
        };
        c(function () {
          db.collection('user_db').find().count(function (err, number) {
            expect(number).to.eql(1);
          });
        });
      });
    });
  });

  describe('the middle ground', function () {
    it('should be able to test the number of active elements', function (){
      ready(function (db, done) {
        db.collection('user_db').find().count(function (err, number) {
          expect(number).to.eql(0);
        });
      });
    });
  });
});

describe('Testing Users For Location Name', function () {
  before(function () {
    clean = mongo.cleanCollections(['user_db', 'collection_Tommy']);
    ready(function (db, done) {
      db.collection('user_db').insert({ name: 'Tommy', collection_name: 'collection_Tommy'}, done);
    });
  });

  it('should count the new insertion!', function () {
    ready(function (db, done) {
      db.collection('user_db').find().count(function (err, number) {
        expect(number).toEqual(1);
      });
    });
  });

  it('should add Tommies collection', function () {
    ready(function (db, done) {
      tommy = db.collection('user_db').findOne({name: 'Tommy'});
      var collection = tommy.collection_name;
      expect(collection).to.eql('collection_Tommy');
    });
  });

  it('should add the tommy collection to the db', function () {
    ready(function (db, done) {
      var cursor = db.collection('collection_Tommy').find();
      expect(cursor.length).to.be(1);
      console.log(cursor);
    });
  });
});

var userCollection;
var username = 'newUser';

describe('A user collection should be created', function () {
  before(function () {
    userCollection = new UserCollection();
  });

  after(function () {
    describe('userCollection.add() complete', function () {
      describe('userCollection.get()', function () {
        it ('should retrieve a present user from the collection', function () {
          ready(function (db, data) {
            var userObj = userCollection.get(username);
            assert(typeof userObj, 'object');
            var doc = db.collection("collection_" + username).findOne();
            var user2 = new User(doc);
            expect(userObj).to.eql(user2);
            done();
          });
        });
        it ('should retrieve the user from the collection', function () {
          ready(function (db, data) {
            var userObj = userCollection.get(username);
            expect(userObj).to.be(undefined);
            done();
          });
        });
      });
    });
  });

  describe('userCollection.add()', function () {
    it ('should add a user to the database', function (done) {
      ready(function (db, done) {
        userCollection.add({name: username});
        var doc = db.collection('user_db').findOne({name: username});
        expect(doc).to.eql({name: username, collection_name: ("collection_" + username)})
        done();
      });
    });
  });
});

// describe('A user should be able to be created', function () {
//   before(function ())

// });

// var user;
// describe('Testing Existing Queries For Query Data', function () {

//   before(function (db, done) {
//     var tweet = { id_str: 'Tweet From Apple!' };
//     user = new User({name: 'Tommy'});
//     query = new Query({query: 'AAPL'})
//   });

//   describe('Testing Users For Location Name', function () {
//     ready(function (db, done) {

//       // user.insert();
//     });
//   });

// });

//   describe('Can view documents into database', function () {
//     it('should display user_db', function () {
//       ready(function(db, done) {
//         var userDbCursor = db.collection('user_db').find();
//         console.log(colors.cyan(userDbCursor));

//       });
//     });
//   });

// describe()

// var clean = mongo.cleanCollections(['coll1', 'coll2']); //only need to create this once

// test('test using cleaned collections', clean(function(db, done) {

//     db.collection('coll1').find().count(function(err, count) {

//         assert.equal(count, 0);
//         done();
//     });
// }));


// var drop = mongo.drop(); //only need to create this once

// test('test using a fresh db', drop(function(db, done) {

//     db.collection('coll1').find().count(function(err, count) {

//         assert.equal(count, 0);
//         done();
//     });
// }));


// describe('Users', function(){

//   before(function () {

//     describe('Module Users', function(){
//       it('should have a method', function(){
//         assert.equal(typeof users, 'object');
//         assert.equal(typeof users.set, 'function');
//       });
//     });

//     describe('Module Users 2', function () {
//       console.log(colors.red(JSON.stringify(users)));
//       it('should allow to be set', function (done) {
//         users.set("users_db", function () {
//           assert.equal(users.collection_name, "users_db");
//           done();
//         });
//       });
//     });


//   });

//   var name = Math.random().toString(36).substring(7);
//   var collection_name = ('collection_'+ name);

//   after(function () {
//     describe('User Module 6', function () {
//       it('should return false if it does not inlude the name: ', function (done) {
//         users.get(name, { not_found: true }, function (doc) {
//           expect(doc).to.eql({ error: "Collection could not be found!"});
//           done();
//         });
//       });
//     });


//     describe('Module Users 4', function () {
//       it ('should not have the name', function (done) {
//         mongo.connect(url, function (err, db) {
//           var collection = db.collection('users_db');
//           console.log(colors.cyan(("Name: " + name)))
//           var cursor = collection.find({name: name});
//           cursor.count(function (err, count) {
//             console.log(colors.cyan(count));
//             expect(count).to.eql(0);
//             done();
//           });
//         });
//       });
//     });
//   });

      // after(function () {
      //   before(function () {
      //     it ('should have the name', function (done) {
      //       mongo.connect(url, function (err, db) {
      //         var collection = db.collection('users_db');
      //         var cursor = collection.find({name: name});
      //         cursor.count(function (err, count) {
      //           expect(count).to.eql(1);
      //         });
      //       });
      //     });
      //     it('should return error if it does not inlude the name: ', function (done) {
      //       userCollections.set({name: name, collection_name: collection_name}, function (doc) {
      //         expect(doc).to.eql({
      //           error: 'User profile not setup yet!'
      //         });
      //         done();
      //       });
      //     });
      //   });

      // after(function () {
      //   mongo.connect(url, function (err, db) {
      //     var collection = db.collection(collection_name);
      //     var cursor = collection.find({name: name});
      //     cursor.findOne(function (err, data) {
      //       expect(count).to.eql(1);
      //     });
      //   });
      // });
    //   });
    // });
  // });
//    describe('Module Users 3', function () {
//     it ('should return with the same item it sent out 2', function (done) {
//       users.get(name, { not_found: false }, function (doc) {
//         var result = {
//           name: name,
//           collection_name: collection_name
//         };
//         delete doc[0]['_id'];
//         expect(doc[0]).to.eql(result);
//         done();
//       });
//     });
//   });


// });


