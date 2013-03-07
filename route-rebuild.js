(function () {
    var http	= require('http');
    var Etudiant	= require('./object-Etudiant.js');

	var rebuildBucket = {};

	function routeRebuild (req, res) {
		var target = req.body.login;
		if (!target) {
			return res.errJson('Pas de login. Utilisez: curl ' + req.host + ' --data "login=$USER".');
		}
		if (!(/^[a-z0-9\-]{1,6}(_[a-z0-9])?$/.test(target))) {
			return res.errJson('Login incorrect (' + target + ').');
		}
		var caller = req.connection.remoteAddress;
		if (rebuildBucket[caller] > new Date(new Date() - 10 * 1000)) {
			var duration = rebuildBucket[caller].getTime();
			duration -= new Date(new Date() - 10 * 1000).getTime();
			duration /= 1000;
			duration = Math.ceil(duration);
			return res.errJson('Veuillez patienter ' + duration + ' secondes avant d\'essayer de nouveau.');
		}
		rebuildBucket[caller] = new Date();
		var url = 'http://perso.epitech.eu/~' + target + '/.cv';
		var sentHeaders = false;
		return http.get(url, function (request) {
			if (request.statusCode === 404) {
				return Etudiant.remove(target, function (err) {
					if (err) return res.errMongo(err);
					return res.errJson('Pas de fichier .cv trouvé pour ' + target);
				});
			}
			var data = '';
			request.on('data', function (chunk) {
				data += chunk;
				if (data.length > 2048) {
					request.destroy();
					sentHeaders = true;
					return res.errJson('Un fichier .cv doit faire moins de 2ko.');
				}
			});
			request.on('end', function () {
				if (sentHeaders) return;
				sentHeaders = true;
				return Etudiant.update(target, data, function (err) {
					if (err) return res.errMongo(err);
					return res.json({status: 'SUCCESS', message: 'Fichier .cv mis à jour avec succès pour ' + target + '!'});
				});
			});
			request.on('error', function (err) {
				if (sentHeaders) return;
				sentHeaders = true;
				console.dir(err);
				return res.errJson('Erreur dans la requête du serveur {Epitech}.');
			});
		});
	};


	module.exports = routeRebuild;
})();
