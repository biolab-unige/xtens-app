/**
* @author massi
*/
var path = require('path');
var BundleTracker = require('webpack-bundle-tracker');
var config = require('./webpack.config.base.js');

config.devtool = 'source-map';

config.output.publicPath = 'http://localhost:1337/assets/bundles/';

config.plugins = config.plugins.concat([
    new BundleTracker({path: __dirname, filename: 'webpack-stats-local.json'})
]);

config.module.rules = config.module.rules.concat([
    {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: [
            {loader: 'react-hot-loader'},
            {loader: 'babel-loader'}
        ],
        include: path.join(__dirname, '..', 'client')
    }
]);

module.exports = config;
