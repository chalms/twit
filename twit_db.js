var debug = require('./util/debug.js');
debug.out = ['red','green', 'cyan'];
var config = require('./util/config1.js'); //for API Auth
var Twit = require('twit'); //for twitter api library
var colors = require('colors');  // to add color to your console.logs
var twit = new Twit(config);

module.exports = function (cb) {
  cb({
    deleteId: function (obj, cb) {
      debug.yellow('deleteId =>');
      if (obj.model.hasOwnProperty('_id')) {
        delete obj.model._id;
        return cb(undefined, obj);
      } else {
        return cb(undefined, obj);
      }
    },

    toObj: function (obj, cb, err) {
      debug.yellow('toObj =>');
      if (err) cb(err, undefined);
      if (obj.model.constructor.name === 'model') {
        obj.model = obj.model.toObject();
        this.deleteId(obj, cb);
      } else {
        this.deleteId(obj, cb);
      }
    },

    setupQuery: function (query, cb) {
      console.log(this);
      debug.yellow('setup Query =>');

      function getQueryObject(queryMongoose, cb) {
        debug.yellow('getQueryObject =>');
        cb(queryMongoose.toObject());
      }

      function remove_id(queryObj, cb) {
        debug.yellow('remove_id =>');
        delete queryObj._id;
        cb(queryObj);
      }

      var _this = this;
      getQueryObject(query, function (queryObj) {
        debug.yellow('getQueryObject.callback =>')
        debug.green(queryObj);
        _this.upsert({model: queryObj, modelClass: Query}, cb);
      });
    },

    checkId: function (model, cb) {
      if (!(model)) {
        debug.red('model does not exist!');
      } else if (model._id) {
        debug.green('model has _id');
      } else {
        debug.cyan(model);
      }
      cb(model);
    },

    saveQuery: function (query, cb) {
      debug.yellow('saveQuery =>');
      query.save(function (err) {
        debug.green(query);
        if (err) cb(err, undefined);
        if (!(query._id)) throw "Query has no ObjectID";
        cb(undefined, query);
      });
    },

    find: function(model, modelClass, cb, cb1) {
      debug.yellow('find =>');
      debug.cyan('model: ' + JSON.stringify(model) + '\nmodelClass: ' + modelClass);
      return modelClass.find(model, function(err, dbModel) {
        if (err) {
            return cb(err, undefined);
        } else if (dbModel) {
            return cb(undefined, dbModel);
        } else if (cb1) {
            return cb1();
        } else {
            return cb(undefined, undefined);
        }
      });
    },

    save: function (model, modelClass, cb) {
      debug.yellow('save =>');
      debug.cyan('model: ' + JSON.stringify(model) + '\nmodelClass: ' + modelClass);
      if (!(model._id)) {
        model.save(model, function (err) {
          if (err) return cb(err, undefined);
          return cb(undefined, model);
        });
      }
    },

    upsert: function (obj, cb) {
      debug.yellow('upsert =>');
      debug.cyan(obj);
      var _this = this;
      this.toObj(obj, function (err, model) {
        if (err) return cb(err, undefined);
        _this.find(model, obj.modelClass, cb, function (model) {
          _this.save(model, obj.modelClass, cb);
        });
      });
    }
  });
};

