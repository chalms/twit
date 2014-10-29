var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Tweet = mongoose.model('Tweet', {
  id: { type: Number, unique: true, sparse: true },
  id_str: { type: String, unique: true, sparse: true },
  tags: []
}, {
  strict: false
});

Person.path('id_str').set(function (v) {
  // this is a setter
});

var User = new Schema(User.schema);

var UserCollection = new Schema({

});

Tweet.findOne()
db.on('error', handleError);
product.sold = Date.now();
product.save(function (err, product, numberAffected) {
  if (err) ..
})
Blog.$where('this.comments.length &gt; 5').exec(function (err, docs) {})
function (json) {

  this.model: {
    id: '',
    id_str: "",
    url: "",
    created_at: new Date()
  };

  if (!this.valid) throw "Tweet non-valid error!";

  return this.model;
}

var promise = Candy.create({ type: 'jawbreaker' });
promise.then(function (jawbreaker) {
  // ...
})

Users.aggregate()
  .group({ _id: null, maxBalance: { $max: '$balance' } })
  .select('-id maxBalance')
  .exec(function (err, res) {
    if (err) return handleError(err);
    console.log(res); // [ { maxBalance: 98 } ]
});