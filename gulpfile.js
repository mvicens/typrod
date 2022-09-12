const { src, dest } = require('gulp'),
	injStr = require('gulp-inject-string'),
	nl = '\n',
	pckg = require(require('path').resolve('package.json')),
	distPath = 'dist/',
	ngAnnotate = require('gulp-ng-annotate'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename');

exports.default = () => {
	return src('./typrod.js')
		.pipe(injStr.prepend('/*!' + nl + ` * Typrod v${pckg.version} (${pckg.homepage})` + nl + ' */' + nl + nl))
		.pipe(dest(distPath))
		.pipe(ngAnnotate())
		.pipe(uglify({ output: { comments: /^!/ } }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(distPath));
};