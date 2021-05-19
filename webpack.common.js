const path = require('path');

const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        primary: './src/main/primary_entry/script/primary_entry.js'
    },
    output: {
        filename: "[name].[chunkhash].js",
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [
            //
            // JS
            //
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            //
            // CSS
            //
            // https://github.com/webpack-contrib/css-loader
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    "css-loader"
                ]
            },
            //
            // This is here only so that webpack doesn't try to process font files referenced by bootstrap css.
            // https://github.com/webpack-contrib/url-loader
            {
                test: /(\.woff?$|\.woff2?$|\.ttf?$|.eot?$|\.svg?$)/,
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
        //
        // https://webpack.js.org/plugins/mini-css-extract-plugin/
        //
        new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
            chunkFilename: "[id].[hash].css"
        }),
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
    ]
};