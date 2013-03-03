var http	= require('http');
var express	= require('express');
var Mongo	= require('./module-mongodb.js');

console.log('[Express] Starting');
var app		= express();

console.log('[MongoDb] Connecting');
Mongo.connect(process.env.EPIMASH_DB_URI, function () {
	console.log('[MongoDb] Connected');
});

console.log('[Express] Configuration');
app.configure(function () {
	app.use(function (req, res, next) {
		if (Mongo.connected) return next();
		return res.end('MONGODB ERROR');
	});
	app.use(express.bodyParser());
	app.use(require('./middleware-assets.js')());
	app.use(require('./middleware-errors.js')());
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.param('login', function (req, res, next, login) {
		if (/^[a-z0-9\-]{1,6}(_[a-z0-9])?$/.test(login)) req.params.user = login;
		return next();
	});
	app.use(app.router);
});
var loginRegex = /^\/[a-z0-9\-]{1,6}(_[a-z0-9])?$/;



console.log('[Express] Setting up routes');
// POST route
app.post('*',		require('./route-rebuild.js'));
// GET routes
app.get('/',		require('./route-home.js'));
//app.get('/about',	require('./route-about.js'));
app.get('/random',	require('./route-random.js'));
//app.get('/contact',	require('./route-contact.js'));
app.get('/:login',	require('./route-profile.js'));

app.listen(process.env.PORT || 3000);
console.log('[Express] Now listening!')
