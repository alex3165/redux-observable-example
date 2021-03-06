const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  devtool: 'eval-cheap',
  cache: true,
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel'
      }
    ]
  }
};
