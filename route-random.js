var Slave = require('./object-Slave.js');

module.exports = function (req, res) {
	return Slave.random(function (err, user) {
		if (err) return res.errMongo(err);
		if (!user) return res.end('ERROR: No more users');
		return res.redirect('/' + user.login);
	});
};
