const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const ROOT_FOLDER = __dirname
const SRC_FOLDER = path.join(ROOT_FOLDER, 'src')

module.exports = {
  module: {
    rules: [
      // SASS CSS STYLE LOADER
      {
        test: /\.scss$/,
        use: [
          /**
           * fallback to style - loader in development
           * by enabling the source map it can cause some delay in reading the sass?css file and causing problems with the style.
           * it apply the height of the map before to actually have the real size from the css
           */
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          // 'css-loader?sourceMap=true!',
          // 'sass-loader?sourceMap=true!'
          'css-loader',
          'sass-loader'
        ]
      },
      // CSS STYLE LOADER
      {
        test: /\.css$/,
        use: [
          // fallback to style-loader in development
          process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
          // 'css-loader?sourceMap=true!'
          'css-loader'
        ]
      },
      // BABEL LOADER
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      // BABEL LOADER
      {
        test: /\.json$/,
        loader: 'json-loader',
        type: 'javascript/auto'
      },
      // IMAGE LOADER - FILE LOADER
      // https://www.npmjs.com/package/image-webpack-loader
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?name=img/[name].[ext]',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75
              }
            }
          },
        ]
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin([
      path.join(__dirname, 'dist'),
    ]),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(SRC_FOLDER, 'index.html'),
      chunks: ['boundle'],
    }),

    // EXTRACT CSS FILE FROM JS
    new MiniCssExtractPlugin(),
  ],
}
