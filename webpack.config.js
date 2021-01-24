const path = require('path');

const baseConfig = {
  mode: 'production',
  devtool: false,
  entry: {
    iost: path.resolve(__dirname, './index.ts')
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
}
const serverConfig = {
  ...baseConfig,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].node.js',
    library: 'IOST',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          }
        ],
      },
    ]
  },
}

const clientConfig = {
  ...baseConfig,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    library: 'IOST',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          }
        ],
      },
    ]
  },
}

module.exports = [serverConfig, clientConfig]