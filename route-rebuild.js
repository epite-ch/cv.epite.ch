var http		= require('http');
var Slave		= require('./object-Slave.js');


rebuildBucket = {};

module.exports = function (req, res) {
	var target = req.body.login;
	// CHECK: "target" is supplied
	if (!target) {
		return res.errJson('No login supplied. Use: curl ' + req.host + ' --data "login=$USER"');
	}
	// CHECK: "target" is valid (validates vanity logins too)
	if (!(/^[a-z0-9\-]{1,6}(_[a-z0-9])?$/.test(target))) {
		return res.errJson('Invalid login supplied (' + target + ')');
	}
	// CHECK: No harrassing from "target"
	// WARNING: Check IP too or someone's gonna test ALL fucking logins
	if (rebuildBucket[target] > new Date(new Date() - 10 * 60 * 1000)) {
		var duration = rebuildBucket[target].getTime();
		duration -= new Date(new Date() - 10 * 60 * 1000).getTime();
		duration /= 1000;
		duration /= 60;
		duration = Math.ceil(duration);
		return res.errJson('Please wait ' + duration + ' minutes before trying again for ' + target);
	}
	// SET: Prevent from harrassing server
	rebuildBucket[target] = new Date();
	var url = 'http://perso.epitech.eu/~' + target + '/.slave';
	// Request the slave file
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
			if (data.length > 1024) {
				request.destroy();
				sentHeaders = true;
				return res.errJson('.slave file should be < 1ko');
			}
		});
		request.on('end', function () {
			if (sentHeaders) return;
			sentHeaders = true;
			return Slave.update(target, data, function (err) {
				if (err) return res.errMongo(err);
				return res.json({status: 'SUCCESS', login: target});
			})

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
