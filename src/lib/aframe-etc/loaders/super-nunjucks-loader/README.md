## super-nunjucks-loader

[Nunjucks](https://mozilla.github.io/nunjucks/api.html) loader for Webpack.

### Usage

```
npm install --save super-nunjucks-loader
```

And in your Webpack configuration:

```
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.html/,
        exclude: /(node_modules)/,
        use: ['super-nunjucks-loader'],
        options: {
          globals: {
            PRODUCTION: process.env.NODE_ENV === 'production'
          },
          options: {
            noCache: true
          },
          path: `${__dirname}/src/`
        }
      }
    ]
  }
  // ...
};
```

#### Options

| Name    | Description                                      |
|---------|--------------------------------------------------|
| context | Object of variables to pass as Nunjucks context. |
| globals | Variables to add to Nunjucks global scope.       |
| options | Options passed into `Nunjucks.configure`.        |
| path    | Directory for Nunjucks to find templates.        |

Then require:

```
const htmlString = require('./index.html');
```
