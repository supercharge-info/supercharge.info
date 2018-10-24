const path = require('path');

const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const isWindowsBash = require('is-windows-bash');

module.exports = {
    entry: {
        primary: './src/main/primary_entry/script/primary_entry.js'
    },
    output: {
        filename: "[name].[chunkhash].js",
        path: path.resolve(__dirname, 'webcontent-built')
    },
    devtool: 'source-map',
    module: {
        rules: [
            //
            // JS
            //
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            //
            // CSS
            //
            // https://github.com/webpack-contrib/style-loader
            // https://github.com/webpack-contrib/css-loader
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            //
            // This is here only so that webpack doesn't try to process font files referenced by bootstrap css.
            // https://github.com/webpack-contrib/url-loader
            {
                test: [/\.woff?$/, /\.woff2?$/, /\.ttf?$/, /\.eot?$/, /\.svg?$/],
                loader: 'url-loader'
            },
            //
            // Have webpack copy our images into the build directory. Lots of advanced options available here.
            // For now this is configured to just copy.
            //
            // https://github.com/webpack-contrib/file-loader
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: "file-loader",
                query: {
                    name: "[path][name].[ext]",
                    context: "src/main/primary_entry"
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("[name].[chunkhash].css"),
        //
        // https://github.com/jantimon/html-webpack-plugin
        //
        // Copies our HTML to the build directory and also minifies it, AND insert into
        // the HEAD section references to our generated JS and CSS source files.
        //
        new HtmlWebpackPlugin({
            chunks: ['primary'],
            template: 'src/main/primary_entry/html/index.html',
            filename: 'index.html',
            inject: 'head',
            // https://github.com/kangax/html-minifier#options-quick-reference
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                conservativeCollapse: true,
                preserveLineBreaks: true
            }
        }),
        //
        // Makes some references globally available.
        //
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        //
        // Simply copy these files to the build directory.
        //
        new CopyWebpackPlugin([
            {from: 'src/main/common_entry/.htaccess'},
            {from: 'src/main/common_entry/favicon.ico'},
            {from: 'src/main/common_entry/sitemap.xml'}
        ])
    ],
    //
    // Dev server config options here: https://webpack.js.org/configuration/dev-server/
    // https://github.com/webpack/webpack-dev-server
    devServer: {
        compress: true,
        port: 9090,
        noInfo: false,
        proxy: {
            "/service": {
                target: "https://supercharge.info:443",
                secure: true,
                changeOrigin: true
            }
        },
        historyApiFallback: {
            rewrites: [
                // For these otherwise not found paths send to index.html
                { from: /^\/map/, to: '/index.html' },
                { from: /^\/changes/, to: '/index.html' },
                { from: /^\/data/, to: '/index.html' },
                { from: /^\/charts/, to: '/index.html' },
                { from: /^\/about/, to: '/index.html' },
                { from: /^\/profile/, to: '/index.html' },
            ],
        },
    }
};