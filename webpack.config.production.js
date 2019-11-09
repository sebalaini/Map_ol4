const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(baseConfig, {
  mode: 'production',
  // devtool: 'cheap-module-source-map',

  entry: {
    boundle: [
      '@babel/polyfill',
      './src/index'
    ],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
  },

  plugins: [
    // NODE_ENV should be production so that modules do not perform certain development checks
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
  ],

  optimization: {
    minimizer: [
      // minify the JS bundle
      new TerserPlugin(),
      // minify the CSS bundle
      new OptimizeCSSAssetsPlugin({})
    ]
  },
})
