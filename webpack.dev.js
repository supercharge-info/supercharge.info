const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    //
    // Dev server config options here: https://webpack.js.org/configuration/dev-server/
    // https://github.com/webpack/webpack-dev-server
    devServer: {
        compress: true,
        port: 9090,
        // Configure your local DNS (/etc/hosts) such that this host points to your local machine.  If not doing
        // map development can change this to simply localhost.
        host: "test.supercharge.info",
        noInfo: false,
        // Must use https for local development because the backend server now returns a cookie flagged for https only.
        // This will cause webpack-dev-server to generate a new self signed cert which you must instruct your browser
        // to trust.
        https: true,
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
});