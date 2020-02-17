var createError = require('http-errors');
var express = require('express');
var path = require('path');
var config = require('./config');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var apicache = require('apicache');
var cache = apicache.middleware;
// var lessMiddleware = require('less-middleware');
var logger = require('morgan');


// if (process.env.NODE_ENV === "dev") {}

var locales = require('./locales/locales');

var sitemapRouter = require('./sitemap');

var homeRouter = require('./routes/home');
var projectsRouter = require('./routes/projects');
var aboutRouter = require('./routes/about');
var contactRouter = require('./routes/contact');

var languageRouter = express.Router();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var onlyGet = (req, res) => req.method === 'GET';
// app.use(cache('15 days', onlyGet));

app.use(compression());

app.use(function (req, res, next) {
	var path = req.originalUrl.split('/');

	res.locals.locales = locales;

	if(path[1].length === 2) {
		res.locals.locale = locales[path[1]];
	} else {
		res.locals.locale = locales.fr;
	}

	next();
});

app.use("/sitemap.xml", sitemapRouter);

app.use(locales.en.route + locales.en.home.route, homeRouter);
app.use(locales.fr.home.route, homeRouter);

app.use(locales.en.route + locales.en.projects.route, projectsRouter);
app.use(locales.fr.projects.route, projectsRouter);

app.use(locales.en.route + locales.en.about.route, aboutRouter);
app.use(locales.fr.about.route, aboutRouter);

app.use(locales.en.route + locales.en.contact.route, contactRouter);
app.use(locales.fr.contact.route, contactRouter);

app.use('/robots.txt', function (req, res, next) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow:\nSitemap: " + config.hostName + "/sitemap.xml");
});

app.post('/clearcache', function(req, res, next) {
    res.json(apicache.clear(req.params.target));
    console.log("Cache cleared");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
  	config: config,
	activePage: "error"
  });
});

module.exports = app;
