const { src, dest } = require('gulp'),
	ngFilesort = require('gulp-angular-filesort'),
	concat = require('gulp-concat'),
	pckg = require(require('path').resolve('package.json')),
	nl = '\r\n',
	sep = nl + nl,
	injStr = require('gulp-inject-string'),
	distPath = 'dist/',
	ngAnnotate = require('gulp-ng-annotate'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename');

exports.default = () => {
	return src(['*', 'index'].map((filename, index) => `${index ? '!' : ''}./src/**/${filename}.js`))
		.pipe(ngFilesort())
		.pipe(concat(pckg.name + '.js', { newLine: sep }))
		.pipe(injStr.prepend('/*!' + nl + ` * Typrod v${pckg.version} (${pckg.homepage})` + nl + ' */' + sep))
		.pipe(dest(distPath))
		.pipe(ngAnnotate())
		.pipe(uglify({ output: { comments: /^!/ } }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest(distPath));
};