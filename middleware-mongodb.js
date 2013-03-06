(function () {
	var Mongo = require('./module-mongodb.js');

	function middlewareMongoDb () {
		return function mongoDb (req, res, next) {
			if (Mongo.connected) return next();
			/*
			// TODO: Render a proper error view for HTTP 500
			//
			// Keep the writeHead call (sexy HTTP logging) and use a res.render
			// attached to a 500.ejs or anything of the like.
			*/
			res.writeHead(500, {'Content-Type': 'text/plain'});
			return res.end('MONGODB ERROR');
		};
	};

	module.exports = middlewareMongoDb;
})()
