var electron = require('electron');
var ip = require('ip');
var path = require('path');
var webpack = require('webpack');

const PLUGINS = [
  new webpack.EnvironmentPlugin(
    {
      NODE_ENV: 'development',
      SSL: false,
      DEBUG: false
    }
  ),
  new webpack.HotModuleReplacementPlugin()
];

const NODE_ENV = process.env.NODE_ENV || 'development';
const scene_path = path.join(electron.app.getPath("userData"), 'scene');
const node_modules_path = path.join(electron.app.getAppPath(), 'node_modules');

module.exports = {
  target: 'electron-renderer',
  mode: 'development',
  entry: {
    build: path.join(scene_path, 'index.js')
  },
  output: {
    path: __dirname,
    filename: 'build/[name].js'
  },
  plugins: PLUGINS,
  module: {
    noParse: /\.html|\.glsl/,
    rules: [
      {
        test: /\.js/,
        use: [{ loader: 'babel-loader' }, { loader: 'aframe-super-hot-loader' } ],
        include: node_modules_path
      },
      {
        test: /\.html/,
        use: [
          'aframe-super-hot-html-loader',
          {
            loader: 'super-nunjucks-loader',
            options: {
              globals: {
                HOST: ip.address(),
                IS_PRODUCTION: process.env.NODE_ENV === 'production'
              },
              path: process.env.NUNJUCKS_PATH || scene_path
            }
          },
          {
            loader: 'html-require-loader',
            options: {
              root: scene_path
            }
          }
        ]
      },
      {
        test: /\.glsl/,
        loader: 'webpack-glsl-loader',
        include: node_modules_path,
        exclude: /(node_modules)/
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
    extensions: ['.js', '.jsx', '.json', '.html'],
    modules: [node_modules_path],
  }
};

