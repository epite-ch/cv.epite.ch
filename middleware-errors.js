(function () {
	function middlewareErrors () {
		return function errors (req, res, next) {
			res.errJson = function (err) {
				console.log('[ERROR] %s', err);
				return res.json({status: 'ERROR', error: err});
			};

			/*
			// TODO: Rendering a REAL error instead of JSON
			//
			// Once we get a real HTTP 500 page, we should look at errMongo's
			// error reply to the client, check the client doing the call, the
			// accept values and send back either JSON like right now or a real
			// and human-readable HTML page.
			*/
			res.errMongo = function (err) {
				console.log('[ERROR][MongoDb] %s', err);
				console.dir(err);
				err = 'MongoDb error. Error has been logged for analysis, please contact rouyer_a@epitech.net';
				return res.json({status: 'ERROR', error: err});
			}
			return next();
		};
	};

	module.exports = middlewareErrors;
})();
