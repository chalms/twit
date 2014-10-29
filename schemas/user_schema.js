var mongoose = require('mongoose');
var Schema = mongoose.Schema;
QuerySchema = require('./query_schema.js');

UserSchema = new Schema({
  name: {type: String, unique: true, sparse: true },
  password: {type: String, index: true },
  updated_at: { type: Date, default: Date.now },
  queries: [QuerySchema.ObjectId],
  created_at: Date
});

UserSchema.pre('save', function (next) {
  if (!this.created_at) this.created_at = new Date();
});


module.exports = UserSchema;