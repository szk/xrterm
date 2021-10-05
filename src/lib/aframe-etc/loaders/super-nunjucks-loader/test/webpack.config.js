module.exports = {
  entry: {
    build: './index.js'
  },
  output: {
    path: __dirname,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.html/,
        use: [{
          loader: 'super-nunjucks-loader',
          options: {
            globals: {
              IS_PRODUCTION: process.env.NODE_ENV === 'production'
            },
            path: __dirname
          }
        }]
      }
    ]
  }
};
