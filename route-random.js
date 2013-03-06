(function () {
	var Slave = require('./object-Slave.js');

	function routeRandom (req, res) {
		return Slave.random(function (err, user) {
			if (err) return res.errMongo(err);
			if (!user) return res.errJson('No more users...');
			return res.redirect('/' + user.login);
		});
	};


	module.exports = routeRandom;
})();
