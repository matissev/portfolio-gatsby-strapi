
/* ================================================================================ */
/* REQUIRES == REQUIRES == REQUIRES == REQUIRES == REQUIRES == REQUIRES == REQUIRES */
/* ================================================================================ */

var gulp = require('gulp'),
	fs = require('fs'),
	plumber = require('gulp-plumber'),
	notify = require('gulp-notify'),

	watch = require('gulp-watch'),
	plumber = require('gulp-plumber'),

	less = require('gulp-less'),
	cssmin = require('gulp-clean-css'),
	prefixer = require('gulp-autoprefixer'),

	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify');


/* ==================================================================================== */
/* HELPERS == HELPERS == HELPERS == HELPERS == HELPERS == HELPERS == HELPERS == HELPERS */
/* ==================================================================================== */

var paths = {
	js : 'public/javascripts', /* No file type is specified because of _compile.json */
	styles : 'public/stylesheets'
};

var onError = function(err) {
	notify.onError({
		title: 'Compilation error',
		message: '<%= error.message %>',
		sound: 'Tink'
	})(err);
	
	this.emit('end');
};


/* ======================================================================================= */
/* DEV TASKS == DEV TASKS == DEV TASKS == DEV TASKS == DEV TASKS == DEV TASKS == DEV TASKS */
/* ======================================================================================= */

gulp.task('js', function(){
	watch([paths.js + '/**/*.*', '!' + paths.js + '/**/*.min.js'], {ignoreInitial: false}, function () {
		var scripts = JSON.parse(fs.readFileSync(paths.js + '/_compile.json', { encoding: 'utf8' }));
		return scripts.forEach(function(obj){
			return gulp.src(obj.src)
				.pipe(plumber({errorHandler: onError}))
				.pipe(sourcemaps.init())
				.pipe(concat(obj.name))
				.pipe(sourcemaps.write())
				.pipe(gulp.dest(paths.js));
		});
	});
});

gulp.task('less', function(){
	watch(paths.styles + '/**/*.less', {ignoreInitial: false}, function () {
		return gulp.src(paths.styles + '/*.less')
			.pipe(plumber({errorHandler: onError}))
			.pipe(sourcemaps.init())
			.pipe(less())
			.pipe(prefixer('last 4 versions'))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(paths.styles));
	});
});


/* ============================================================================================== */
/* PROD TASKS == PROD TASKS == PROD TASKS == PROD TASKS == PROD TASKS == PROD TASKS == PROD TASKS */
/* ============================================================================================== */

gulp.task('js-prod', function() {
	var scripts = JSON.parse(fs.readFileSync(paths.js + '/_compile.json', { encoding: 'utf8' }));

	return scripts.forEach(function(obj){
		return gulp.src(obj.src)
			.pipe(concat(obj.name))
			.pipe(uglify())
			.pipe(gulp.dest(paths.js));
	});
});

gulp.task('less-prod', function(){
	return gulp.src(paths.styles + '/*.less')
		.pipe(less())
		.pipe(prefixer('last 4 versions'))
		.pipe(cssmin({level:2}))
		.pipe(gulp.dest(paths.styles));
});


/* ==================================================================================== */
/* GLOBALS == GLOBALS == GLOBALS == GLOBALS == GLOBALS == GLOBALS == GLOBALS == GLOBALS */
/* ==================================================================================== */

gulp.task('default', ['js', 'less']);

gulp.task('prod', ['js-prod', 'less-prod']);
