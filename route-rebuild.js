(function () {
	var http	= require('http');
	var Slave	= require('./object-Slave.js');

	var rebuildBucket = {};

	function routeRebuild (req, res) {
		var target = req.body.login;
		if (!target) {
			return res.errJson('No login supplied. Use: curl ' + req.host + ' --data "login=$USER"');
		}
		// CHECK: "target" is valid (validates vanity logins too)
		if (!(/^[a-z0-9\-]{1,6}(_[a-z0-9])?$/.test(target))) {
			return res.errJson('Invalid login supplied (' + target + ')');
		}
		// CHECK: No harrassing
		var caller = req.connection.remoteAddress;
		if (rebuildBucket[caller] > new Date(new Date() - 10 * 1000)) {
			var duration = rebuildBucket[caller].getTime();
			duration -= new Date(new Date() - 10 * 1000).getTime();
			duration /= 1000;
			duration = Math.ceil(duration);
			return res.errJson('Please wait ' + duration + ' seconds before trying again.');
		}
		// SET: Prevent from harrassing server
		rebuildBucket[caller] = new Date();

		// Request the slave file
		var url = 'http://perso.epitech.eu/~' + target + '/.slave';
		var sentHeaders = false;
		return http.get(url, function (request) {
			// In case there is no .slave file, we remove the Slave from database
			if (request.statusCode === 404) {
				return Slave.remove(target, function (err) {
					if (err) return res.errMongo(err);
					return res.errJson('No .slave file found for ' + target);
				});
			}
			// Get the data
			var data = '';
			request.on('data', function (chunk) {
				data += chunk;
				// Protect against .slave files > 2ko
				if (data.length > 2048) {
					request.destroy();
					sentHeaders = true;
					return res.errJson('.slave file should be < 2ko');
				}
			});
			request.on('end', function () {
				if (sentHeaders) return;
				sentHeaders = true;
				return Slave.update(target, data, function (err) {
					if (err) return res.errMongo(err);
					return res.json({status: 'SUCCESS', login: target});
				});
			});
			request.on('error', function (err) {
				// PREPARE FOR BETTER DEBUGGING SUCKERS!
				if (sentHeaders) return;
				sentHeaders = true;
				console.dir(err);
				return res.errJson('Error requesting Epitech server. Error has been logged, please contact rouyer_a@epitech.net');
			});
		});
	};


	module.exports = routeRebuild;
})();
