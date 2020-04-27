/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const CopyPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack');
const path = require('path')

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, process.env.NODE_ENV === 'production' ? 'dist' : 'local',)
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.NODE_ENV === 'production' ? '' : 'source-map',
    resolve: {
      mainFields: ['module', 'main', 'browser'],
    },
    plugins: [
        new CopyPlugin([
          { from: './src/index.html', to: './index.html' },
          { from: './src/img/ml.svg', to: './img/ml.svg' },
        ]),
        new Dotenv({
          path: process.env.NODE_ENV === 'production' ? null : './.env.local',
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
