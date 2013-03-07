(function () {
	var url			= require('url');
	var Etudiant	= require('./object-Etudiant.js');

	function routeProfile (req, res, next) {
		var target = req.params.user;
		return Etudiant.get(target, function (err, cv) {
			if (err) return res.errMongo(err);
			if (!cv) return next();
			return res.render('profil', { user: cv });
		});
	};


	module.exports = routeProfile;
})();
