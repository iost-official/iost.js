var path = require('path');

module.exports = {
  mode: 'production',
  devtool: false,
  entry: {
    iost : path.resolve(__dirname, './index.js')
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].min.js',
    library: 'IOST',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      { 
        test: /\.js$/, 
        loader: 'babel-loader'
      },
    ]
  },
};