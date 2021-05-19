const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    //
    // Dev server config options here: https://webpack.js.org/configuration/dev-server/
    // https://github.com/webpack/webpack-dev-server
    devServer: {
        port: 9090,
        host: "localhost",
        noInfo: false,
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
                { from: /^\/map/, to: '/index.html' },
                { from: /^\/changes/, to: '/index.html' },
                { from: /^\/data/, to: '/index.html' },
                { from: /^\/charts/, to: '/index.html' },
                { from: /^\/about/, to: '/index.html' },
                { from: /^\/profile/, to: '/index.html' },
            ],
        },
    }
});