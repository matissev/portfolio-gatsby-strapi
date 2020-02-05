var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');
var config = require('./config');

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
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

languageRouter.route('/:language(en|)').get(function (req, res, next) {
	if(req.params.language === "") {
		req.params.language = "fr";
	}

	res.locals.language = req.params.language.toUpperCase();
	next();
});

languageRouter.use('/', homeRouter);
languageRouter.use('/projects', projectsRouter);
languageRouter.use('/about', aboutRouter);
languageRouter.use('/contact', contactRouter);

app.use('/', languageRouter);

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
  res.render('error');
});

module.exports = app;
