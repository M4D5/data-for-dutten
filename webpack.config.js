const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    context: __dirname + "/src",
    entry: {
        contentscript: "./contentscript.js",
        background: "./background.js"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: /app/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new CopyPlugin({
            patterns: [
                { from: "./assets", to: __dirname + "/dist"}
            ]
        }),
    ]
}
