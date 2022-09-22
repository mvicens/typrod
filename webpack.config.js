const path = require('path'),
	folder = path.join(__dirname, 'demo/'),
	HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: folder + 'index.js',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			}
		],
	},
	plugins: [new HtmlWebpackPlugin({ template: folder + 'index.html' })]
};