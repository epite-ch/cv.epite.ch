var Slave = require('./object-Slave.js');

module.exports = function (req, res) {
	return Slave.random(function (err, login) {
		if (err) return res.errMongo(err);
		return res.redirect('/' + login.login);
	});
};
