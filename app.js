(function () {
	var http		= require('http');
	var express		= require('express');
	var Mongo		= require('./module-mongodb.js');
	var staticView	= require('./module-staticview.js');
	var _E			= require('./module-log.js').log('Express');
	var _M			= require('./module-log.js').log('MongoDb');

	_E('Starting');
	var app = express();

	_M('Connecting');
	Mongo.connect(process.env.EPIMASH_DB_URI, function (err) {
		if (err) return _M('Error connecting:', err);
		return _M('Connected');
	});

	_E('Configuration');
	app.configure(function () {
		app.use(require('./middleware-assets.js')());
		app.use(require('./middleware-errors.js')());
		app.use(require('./middleware-mongodb.js')());
		app.use(express.bodyParser());
		// Views engine
		app.set('views', __dirname + '/views');
		app.set('view engine', 'ejs');
		// Param getter. Used for /:login routes
		app.param('login', function (req, res, next, login) {
			if (/^[a-z0-9\-]{1,6}(_[a-z0-9])?$/.test(login)) req.params.user = login;
			return next();
		});
		app.use(app.router);
	});

	_E('Setting up routes');

	// POST route
	app.post('*',				require('./route-rebuild.js'));
	// GET routes (Static views)
	app.get('/',				staticView('home'));
	app.get('/a-propos',		staticView('a-propos'));
	app.get('/contact',			staticView('contact'));
	app.get('/comment-faire',	staticView('comment-faire'));

	// GET routes (Dynamic views)
	app.get('/roulette',		require('./route-random.js'));
	app.get('/:login',			require('./route-profile.js'));

	// GET 404 (What should we do? 404 page or just redirect to home?)
	//app.get('*',		staticView('404'));

	app.listen(process.env.PORT || 3000);
	_E('Now listening!')
})();
