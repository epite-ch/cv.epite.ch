(function () {
	var iniparser	= require('iniparser');
	var Mongo		= require('./module-mongodb.js');

	// Initialize the object
	function Slave () { };

	/*
	// Slave.random (callback)
	//
	// Returns the login of a random Slave. To ensure a fair enthropy, we sort
	// by a date field that is updated to the current date/time once the user is
	// returned. That way, the user that hasn't been returned by random for the
	// longest is returned.
	*/
	Slave.random = function (callback) {
		var query	= { 'slave_active': true };
		var sort	= [ [ 'slave.last', 'asc']];
		var mod		= { '$set': { 'slave.last': new Date() } };
		var opts	= { 'fields': { 'login': 1, '_id': 0 } };
		return Mongo.Slaves.findAndModify(query, sort, mod, opts, callback);
	}

	/*
	// Slave.get (login, callback)
	//
	// Returns the complete document for a Slave. Processing is done here.
	*/
	Slave.get = function (login, callback) {
		var query = { 'login': login };
		return Mongo.Slaves.findOne(query, function (err, user) {
			if (err) return callback(err);
			if (!user || !user.slave) return callback(null, null);
			/*
			// TODO: Use API to fill misc info
			//
			// Current fields are taken from an old scrape of the whole Intranet
			// and won't reflect future changes. Would be cool if the slaves DB
			// only contained info taken from .slaves files.
			*/
			user.slave.city = user.city;
			user.slave.login = user.login;
			user.slave.fullname = user.name;
			user.slave.promotion = user.promo;
			return callback(null, user.slave);
		});
	}

	/*
	 * Slave.update (login, data, callback)
	 *
	 */
	Slave.update = function (login, data, callback) {
		var slave	= iniparser.parseString(data);
		if (slave.description && slave.description.favorites) {
			slave.description.favorites = slave.description.favorites.split(',');
		}
		var query	= { 'login': login };
	 	var mod		= { '$set': { 'slave_active': true, 'slave': slave } };
		return Mongo.Slaves.update(query, mod, callback);
	}

	/*
	 * Slave.remove (login, callback)
	 *
	 * Database is shared, we can't just forcibly delete the user so we only
	 * remove the informations regarding its slave information.
	 */
	Slave.remove = function (login, callback) {
		var query	= { 'login': login };
		var mod		= { '$set': { 'slave_active': false }, '$unset': { 'slave': 1 } };
		var opts	= { 'safe': true };
		return Mongo.Slaves.update(query, mod, opts, callback);
	}

	module.exports = Slave;
})();
