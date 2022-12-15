const { src, dest } = require('gulp'),
	$ = require('gulp-load-plugins')(),
	pckg = require('./package.json'),
	name = pckg.name,
	nl = '\r\n',
	sep = nl + nl,
	_ = require('lodash'),
	path = 'dist/';

function build() {
	return src(['*', 'index'].map((filename, i) => `${i ? '!' : ''}src/**/${filename}.js`))
		.pipe($.angularFilesort())
		.pipe($.concat(name + '.js', { newLine: sep }))
		.pipe($.injectString.prepend('/*!' + nl + ` * ${_.startCase(name)} v${pckg.version} (${pckg.homepage})` + nl + ' */' + sep))
		.pipe(dest(path))
		.pipe($.ngAnnotate())
		.pipe($.uglify({ output: { comments: /^!/ } }))
		.pipe($.rename({ suffix: '.min' }))
		.pipe(dest(path));
}

exports.build = build;
exports.default = build;