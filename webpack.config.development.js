const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const port = process.env.PORT || 3000

const ROOT_FOLDER = __dirname
const SRC_FOLDER = path.join(ROOT_FOLDER, 'src')

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',

  entry: {
    boundle: [
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
      './src/index'
    ],
  },

  output: {
    publicPath: `http://localhost:${port}/`
  },

  plugins: [
    new webpack.NamedModulesPlugin(),
    // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
    new webpack.HotModuleReplacementPlugin(),

    // “If you are using the CLI, the webpack process will not exit with an error code by enabling this plugin.”
    // https://github.com/webpack/docs/wiki/list-of-plugins#noerrorsplugin
    new webpack.NoEmitOnErrorsPlugin(),

    // PARKING WEB
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(SRC_FOLDER, 'index.html'),
      chunks: ['boundle'],
    }),

    new CopyWebpackPlugin([
      {
        from: 'src/img',
        to: 'img',
        toType: 'dir'
      },
    ])
  ],
})
