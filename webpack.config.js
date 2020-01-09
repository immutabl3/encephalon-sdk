const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const { format } = require('date-fns');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  entry: {
    'encephalon.min.js': './browser.js',
  },
  mode: 'production',
  devtool: 'source-map',
  output: {
    library: 'encephalon',
    libraryTarget: 'umd',
    path: path.resolve(process.cwd(), 'dist'),
    filename: ({ chunk: { name } }) => name,
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  edge: '40',
                  firefox: '68',
                  chrome: '79',
                  safari: '13',
                },
                useBuiltIns: 'entry',
                corejs: 3,
                loose: true,
              },
            ],
          ],
          plugins: [
            [
              '@babel/plugin-transform-runtime',
              {
                absoluteRuntime: false,
                corejs: 3,
                helpers: true,
                regenerator: true,
                useESModules: true,
              },
            ],
          ],
        },
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new webpack.BannerPlugin({
      entryOnly: true,
      banner() {
        const { homepage, author, version, license } = pkg;
        const date = format(new Date(), 'yyyy-MM-dd');
        const year = new Date().getFullYear();
        return (`
@encephalon/sdk - v${version} - ${date}
${homepage}
Copyright (c) ${year} ${author} License: ${license}
				`);
      },
    }),
    new CompressionPlugin({
      filename({ path, query }) {
        return `${path}.gz${query}`;
      },
    })
  ]
};