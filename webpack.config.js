const path = require('path');

const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    //
    // Dev server config options here: https://webpack.js.org/configuration/dev-server/
    // https://github.com/webpack/webpack-dev-server
    devServer: {
        port: 9090,
        host: "localhost",
        https: false,
        proxy: {
            "/service": {
                // Remove "test." prefix from this hostname to test locally with prod API/data.
                target: "https://test.supercharge.info:443",
                secure: true,
                changeOrigin: true
            }
        },
        historyApiFallback: {
            rewrites: [
                // For these otherwise not found paths send to index.html
                {from: /^\/map/, to: '/index.html'},
                {from: /^\/changes/, to: '/index.html'},
                {from: /^\/data/, to: '/index.html'},
                {from: /^\/charts/, to: '/index.html'},
                {from: /^\/about/, to: '/index.html'},
                {from: /^\/profile/, to: '/index.html'},
            ],
        },
    },
    entry: {
        primary: './src/main/primary_entry/script/primary_entry.js'
    },
    mode: 'production',
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
            // https://github.com/webpack-contrib/css-loader
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader']
            },
            //
            // This is here only so that webpack doesn't try to process font files referenced by bootstrap css.
            // https://github.com/webpack-contrib/url-loader
            {
                test: /(\.woff?$|\.woff2?$|\.ttf?$|.eot?$|\.svg?$|\.gif?$)/,
                loader: 'url-loader'
            },
            //
            // Make images available to import/reference from JS.
            //
            // https://webpack.js.org/guides/asset-modules/
            {
                test: /\.png$/,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext]'
                }
            }
        ]
    },
    output: {
        filename: "[name].[chunkhash].js",
        path: path.resolve(__dirname, 'build'),
        clean: true
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                chart: {
                    test: /[\\/]node_modules[\\/]highcharts/,
                    chunks: "all"
                },
                datatables: {
                    test: /[\\/]node_modules[\\/]datatables.*/,
                    chunks: "all"
                },
                jquery: {
                    test: /[\\/]node_modules[\\/]jquery.*/,
                    chunks: "all"
                },
                map: {
                    test: /[\\/]node_modules[\\/](leaflet|map-obj|@mapbox).*/,
                    chunks: "all"
                }
            }
        }
    },
    //
    // https://webpack.js.org/configuration/performance
    //
    performance: {
        // Suppress warnings about max asset size for now so that any other warnings are more visible.
        maxEntrypointSize: 2*1000*1000,
        maxAssetSize: 2*1000*1000
    },
    plugins: [
        //
        // https://webpack.js.org/plugins/mini-css-extract-plugin/
        //
        new MiniCssExtractPlugin({
            filename: "[name].[chunkhash].css",
            chunkFilename: "[id].[chunkhash].css"
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
        // https://webpack.js.org/plugins/copy-webpack-plugin/
        //
        new CopyWebpackPlugin({
            patterns: [
                {from: 'src/main/common_entry/.htaccess'},
                {from: 'src/main/common_entry/favicon.ico'},
                {from: 'src/main/common_entry/sitemap.xml'}
            ]
        })
    ]
};