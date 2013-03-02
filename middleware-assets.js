module.exports = function () {
	return function (req, res, next) {
		var path = require('url').parse(req.url).pathname;
		if (path.indexOf('/assets') === 0) {
			return res.sendfile(__dirname + path);
		}
		return next();
	};
};
