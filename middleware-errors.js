module.exports = function () {
	return function (req, res, next) {
		res.errJson = function (err) {
			console.log('[ERROR] %s', err);
			return res.json({status: 'ERROR', error: err});
		};
		res.errMongo = function (err) {
			console.log('[ERROR][MongoDb] %s', err);
			console.dir(err);
			err = 'MongoDb error. Error has been logged for analysis, please contact rouyer_a@epitech.net';
			return res.json({status: 'ERROR', error: err});
		}
		return next();
	};
};
