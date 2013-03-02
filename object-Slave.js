var iniparser	= require('iniparser');
var Mongo		= require('./module-mongodb.js');


(function () {
	// Initialize the object
	function Slave () { };

	/*
	 * Slave.random (callback)
	 */
	Slave.random = function (callback) {
		var query = { 'slave.active': true };
		var sort = [ [ 'slave.last', 'asc']];
		var mod = { $set: { 'slave.last': new Date() } };
		var opts = { fields: { login: 1 } };
		return Mongo.Slaves.findAndModify(query, sort, mod, opts, callback);
	}

	/*
	 * Slave.get (login, callback)
	 */
	Slave.get = function (login, callback) {
		var query = { login: login };
		return Mongo.Slaves.findOne(query, callback);
	}

	/*
	 * Slave.update (login, data, callback)
	 */
	Slave.update = function (login, data, callback) {
		var query = { login: login };
		var mod = { $set: { slave: iniparser.parseString(data) } };
		return Mongo.Slaves.update(query, mod, callback);
	}

	/*
	 * Slave.remove (login, callback)
	 *
	 * Database is shared, we can't just forcibly delete the user so we only
	 * remove the informations regarding its slave information.
	 */
	Slave.remove = function (login, callback) {
		var query = { login: login };
		var mod = { $unset: { slave: 1 } };
		var opts = { safe: true };
		return Mongo.Slaves.update(query, mod, opts, callback);
	}

	module.exports = Slave;
})();
