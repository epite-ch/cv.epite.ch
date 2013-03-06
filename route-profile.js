(function () {
	var url			= require('url');
	var Slave		= require('./object-Slave.js');

	function routeProfile (req, res, next) {
		var target = req.params.user;
		return Slave.get(target, function (err, slave) {
			if (err) return res.errMongo(err);
			if (!slave) return next();

			return res.render('profile', { user: slave });
		});
	};


	module.exports = routeProfile;
})();
