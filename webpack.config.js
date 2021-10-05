var fs = require('fs');
var ip = require('ip');
var path = require('path');
var webpack = require('webpack');

const PLUGINS = [
  // new webpack.EnvironmentPlugin(
  //   {
  //     NODE_ENV: 'development',
  //     SSL: false,
  //     DEBUG: false
  //   }
  // ),
  new webpack.HotModuleReplacementPlugin()
];

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  mode: 'development',
  devServer: {
    // disableHostCheck: false,
    hot: true,
    liveReload: false,
    // overlay: true,
    // warnings: true,
    static: path.join(__dirname, './')
  },
  entry: {
    build: path.join(__dirname, 'scene', 'index.js')
  },
  output: {
    path: __dirname,
    filename: 'build/[name].js'
  },
  plugins: PLUGINS,
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /(node_modules)/,
        use: ['babel-loader',
              path.resolve(__dirname, 'src/lib/aframe-etc/loaders/aframe-super-hot-loader')]
      },
      {
        test: /\.html/,
        exclude: /(node_modules)/,
        use: [path.resolve(__dirname, 'src/lib/aframe-etc/loaders/aframe-super-hot-html-loader'),
              {
                loader: path.resolve(__dirname, 'src/lib/aframe-etc/loaders/super-nunjucks-loader'),
                options: {
                  globals: {
                    HOST: ip.address(),
                    IS_PRODUCTION: process.env.NODE_ENV === 'production'
                  },
                  path: process.env.NUNJUCKS_PATH || path.join(__dirname, 'scene')
                }
              },
              {
                loader: 'html-require-loader',
                options: {
                  root: path.resolve(__dirname, 'scene')
                }
              }
             ]
      },
      {
        test: /\.glsl/,
        exclude: /(node_modules)/,
        loader: path.resolve(__dirname, 'src/lib/aframe-etc/loaders/webpack-glsl-loader')
      },
      {
        test: /\.css$/,
        exclude: /(node_modules)/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.png|\.jpg/,
        exclude: /(node_modules)/,
        use: ['url-loader']
      }
    ]
  },
  resolve: {
    modules: [path.join(__dirname, 'node_modules')]
  }
};
