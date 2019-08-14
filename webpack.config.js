const CopyPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.NODE_ENV === 'production' ? 'hidden-sourcemap' : 'source-map',
    plugins: [
        new CopyPlugin([
          { from: './src/index.html', to: './index.html' },
          { from: './src/img/ml.svg', to: './img/ml.svg' },
        ]),
        new Dotenv({
          path: process.env.NODE_ENV === 'production' ? './.env.production' : './.env.local',
        }),
    ],
    module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ]
          }
        ]
    }
}