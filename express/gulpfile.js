
/* ================================================================================ */
/* REQUIRES == REQUIRES == REQUIRES == REQUIRES == REQUIRES == REQUIRES == REQUIRES */
/* ================================================================================ */

const { src, dest, parallel } = require('gulp');
const fs = require('fs');
const notify = require('gulp-notify');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');

const less = require('gulp-less');
const cssmin = require('gulp-clean-css');
const prefixer = require('gulp-autoprefixer');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');


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

function js() {
	watch([paths.js + '/**/*.*', '!' + paths.js + '/**/*.min.js'], {ignoreInitial: false}, function () {
		var scripts = JSON.parse(fs.readFileSync(paths.js + '/_compile.json', { encoding: 'utf8' }));
		return scripts.forEach(function(obj){
			return src(obj.src, { sourcemaps: true })
				.pipe(plumber({errorHandler: onError}))
				.pipe(concat(obj.name))
				.pipe(dest(paths.js, { sourcemaps: true }));
		});
	});
}

function css() {
	watch(paths.styles + '/**/*.less', {ignoreInitial: false}, function () {
		return src(paths.styles + '/style.less')
			.pipe(plumber({errorHandler: onError}))
			.pipe(sourcemaps.init())
			.pipe(less())
			.pipe(prefixer('last 4 versions'))
			.pipe(sourcemaps.write('.'))
			.pipe(dest(paths.styles));
	});
}


/* ============================================================================================== */
/* PROD TASKS == PROD TASKS == PROD TASKS == PROD TASKS == PROD TASKS == PROD TASKS == PROD TASKS */
/* ============================================================================================== */

function jsProd() {
	var scripts = JSON.parse(fs.readFileSync(paths.js + '/_compile.json', { encoding: 'utf8' }));

	return scripts.forEach(function(obj){
		return src(obj.src)
			.pipe(concat(obj.name))
			.pipe(uglify())
			.pipe(dest(paths.js));
	});
}

function cssProd() {
	return src(paths.styles + '/style.less')
		.pipe(less())
		.pipe(prefixer('last 4 versions'))
		.pipe(cssmin({level:2}))
		.pipe(dest(paths.styles));
}


/* ==================================================================================== */
/* GLOBALS == GLOBALS == GLOBALS == GLOBALS == GLOBALS == GLOBALS == GLOBALS == GLOBALS */
/* ==================================================================================== */

exports.default = parallel(js, css);
exports.prod = parallel(jsProd, cssProd);
