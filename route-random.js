(function () {
	var Etudiant = require('./object-Etudiant.js');

	function routeRandom (req, res) {
		return Etudiant.random(function (err, user) {
			if (err) return res.errMongo(err);
			if (!user) return res.errJson('Pas de CVs...');
			return res.redirect('/' + user.login);
		});
	};


	module.exports = routeRandom;
})();
