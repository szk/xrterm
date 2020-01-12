var webpack = require('webpack');

module.exports = {
  entry: {
    js: './index.js',
  },
  output: {
    path: __dirname,
    filename: './term.min.js'
  },
  module: {
    rules: [
      {
        use: {
          loader: 'babel-loader',
          options: 'cacheDirectory=.babel_cache',
        },
      },
    ],
  },
  plugins: [],
};

