var url			= require('url');
var Slave		= require('./object-Slave.js');

module.exports = function (req, res, next) {
	var target = req.params.user;
	return Slave.get(target, function (err, user) {
		if (err) return res.errMongo(err);
		if (!user || !user.slave) return next();

		user.slave.city = user.city;
		user.slave.login = user.login;
		user.slave.fullname = user.name;
		user.slave.promotion = user.promo;
		return res.render('profile', { user: user.slave });
	});
};
