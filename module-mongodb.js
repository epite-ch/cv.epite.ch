(function () {
	var mongodb	= require('mongodb');
	var LOG		= require('./module-log.js').log('MongoDb');
	var DIR		= require('./module-log.js').dir('MongoDb');

	var collections = [
		{
			collection: 'users',
			prettyName: 'Slaves'
		}
	];


	var Mongo = function () {};

	Mongo.connected = false;

	Mongo.connect = function (db_uri, cb) {
		return mongodb.connect(db_uri, function (err, db) {
			if (err) return cb(err);
			var i = 0;
			function getNextCollection () {
				if (!collections[i]) {
					Mongo.connected = true;
					return cb();
				}
				var collection = collections[i].collection;
				var prettyName = collections[i].prettyName;
				return db.collection(collection, function (err, coll) {
					if (err) return cb(err);

					coll.findAll = function (query, fields, callback) {
						if ('function' === typeof fields) callback = fields, fields = {};
						return coll.find(query, fields, function (err, cursor) {
							if (err) return callback(err);
							if (!cursor) return callback(null, null);
							return cursor.toArray(callback)
						});
					};

					coll.findOneSort = function (query, sort, callback) {
						return coll.find(query, function (err, cursor) {
							if (err) return callback(err);
							if (!cursor) return callback(null);
							return cursor.sort(sort).limit(1).nextObject(callback);
						});
					};

					Mongo[prettyName] = coll;
					i++;
					return getNextCollection();
				});
			}
			return getNextCollection();
		});
	};

	Mongo.makeObjectId = function (hexstring) {
		return mongodb.BSONPure.ObjectID.createFromHexString(hexstring);
	};

	Mongo.checkObjectId = function (hexstring) {
		if (typeof hexstring === 'undefined') {
			return false;
		}
		if (hexstring.match(/^[0-9a-fA-F]{24}$/) === null) {
			return false;
		}
		return true;
	};

	Mongo.errLog = function (place) {
		return function (err) {
			if (typeof err === 'undefined' || err === null) {
				return;
			}
			LOG(place);
			DIR(err);
			return;
		};
	};

	module.exports = Mongo;
})();

