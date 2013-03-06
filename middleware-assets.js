(function () {
	var URL		= require('url');

	function middlewareAssets () {
		return function assets (req, res, next) {
			var path = URL.parse(req.url).pathname;
			if (path.indexOf('/assets') === 0) {
				return res.sendfile(__dirname + path);
			}
		return next();
		};
	};

	module.exports = middlewareAssets;

})();
