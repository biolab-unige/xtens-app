/**
 * @author massi
 */
const path = require('path');
// const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {

    // This is the "main" file which should include all other modules
    entry: path.resolve(__dirname, '..', 'src', 'index'),
    // Where should the compiled file go?
    output: {
        // To the `dist` folder
        path: path.resolve(__dirname, '..', '..', 'assets', 'bundles'),
        // With the filename `build.js` so it's dist/build.js
        filename: '[name].js'
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '..', 'index.html')
        })
    ],

    module: {

        rules: [
            {
                test: /\.scss$/,
                // loader: 'style!css!sass?outputStyle=expanded'
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            outputStyle: 'expanded'
                        }
                    }
                ],

            },
            {
                test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
                // loader: 'url?limit=10000&mimetype=application/font-woff'
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'application/font-woff'
                        }
                    }
                ]
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                // loader: 'url?limit=10000&mimetype=application/font-woff'
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'application/octet-stream'
                        }
                    }
                ]
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader'
                    }
                ]
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'image/svg+xml'
                        }
                    }
                ]
            }
        ]
    },

    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.jsx']
    }

};
