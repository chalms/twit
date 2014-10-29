
// var query = Candy.find({ bar: true });
// var promise = query.exec();

// promise.onFulfill(function (err, args) {
//   assert.equal(3, a + b);
// });

// promise.fulfill(1, 2);


// var promise = Meetups.find({ tags: 'javascript' }).select('_id').exec();
// promise.then(function (meetups) {
//   var ids = meetups.map(function (m) {
//     return m._id;
//   });
//   return People.find({ meetups: { $in: ids }).exec();
// }).then(function (people) {
//   if (people.length &lt; 10000) {
//     throw new Error('Too few people!!!');
//   } else {
//     throw new Error('Still need more people!!!');
//   }
// }).then(null, function (err) {
//   assert.ok(err instanceof Error);
// });