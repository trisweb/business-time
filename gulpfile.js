var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');
var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');
var colors = require('colors');
var removeEmptyLines = require('gulp-remove-empty-lines');
var shell = require('gulp-shell');

var errorHandler = function(err) {
	console.log("[SASS Error]".yellow + " " + err.toString().red);
}

gulp.task('bower-files', function(){
	gulp.src(mainBowerFiles({ filter: /.*\.js$/i }))
		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(gulp.dest('js'));
	gulp.src(mainBowerFiles({ filter: /.*\.css$/i }))
		.pipe(concat('vendor.css'))
		.pipe(gulp.dest('css'));
});

gulp.task('styles', function(){
	return gulp.src('scss/main.scss')
		.pipe(sass({ outputStyle: 'nested', onError: errorHandler }))
		.pipe(removeEmptyLines())
		.pipe(gulp.dest('css'))
		.pipe(livereload({ auto: false }));
});

gulp.task('watch', function(){
	livereload.listen();
	gulp.watch(['scss/**/*.scss'], ['styles']);
	gulp.watch('bower.json', ['bower-files']);
});

gulp.task('deploy', shell.task([
	'scp -r assets css img index.html js t:~/trisweb-www/business-time/'
]));

gulp.task('default', ['styles', 'watch']);