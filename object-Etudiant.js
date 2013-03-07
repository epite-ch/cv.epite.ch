(function () {
	var iniparser	= require('iniparser');
	var Mongo		= require('./module-mongodb.js');

	// Initialize the object
	function Etudiant () { };

	/*
	// Etudiant.random (callback)
	//
	// Returns the login of a random Etudiant. To ensure a fair enthropy, we sort
	// by a date field that is updated to the current date/time once the user is
	// returned. That way, the user that hasn't been returned by random for the
	// longest is returned.
	*/
	Etudiant.random = function (callback) {
		var query	= { 'cv_active': true };
		var sort	= [ [ 'cv.last', 'asc']];
		var mod		= { '$set': { 'cv.last': new Date() } };
		var opts	= { 'fields': { 'login': 1, '_id': 0 } };
		return Mongo.Etudiants.findAndModify(query, sort, mod, opts, callback);
	}

	/*
	// Etudiant.get (login, callback)
	//
	// Returns the complete document for a Etudiant. Processing is done here.
	*/
	Etudiant.get = function (login, callback) {
		var query = { 'login': login };
		return Mongo.Etudiants.findOne(query, function (err, user) {
			if (err) return callback(err);
			if (!user || !user.cv) return callback(null, null);
			/*
			// TODO: Use API to fill misc info
			//
			// Current fields are taken from an old scrape of the whole Intranet
			// and won't reflect future changes. Would be cool if the CVs DB
			// only contained info taken from .cv files.
			*/
			user.cv.city = user.city;
			user.cv.login = user.login;
			user.cv.fullname = user.name;
			user.cv.promotion = user.promo;
			return callback(null, user.cv);
		});
	}

	/*
	 * Etudiant.update (login, data, callback)
	 *
	 */
	Etudiant.update = function (login, data, callback) {
		var cv = iniparser.parseString(data);
		if (cv.description && cv.description.favorites) {
			cv.description.favorites = cv.description.favorites.split(',');
		}
		var query	= { 'login': login };
	 	var mod		= { '$set': { 'cv_active': true, 'cv': cv } };
		return Mongo.Etudiants.update(query, mod, callback);
	}

	/*
	 * Etudiant.remove (login, callback)
	 *
	 * Database is shared, we can't just forcibly delete the user so we only
	 * remove the informations regarding its CV information.
	 */
	Etudiant.remove = function (login, callback) {
		var query	= { 'login': login };
		var mod		= { '$set': { 'cv_active': false }, '$unset': { 'cv': 1 } };
		var opts	= { 'safe': true };
		return Mongo.Etudiants.update(query, mod, opts, callback);
	}

	module.exports = Etudiant;
})();
