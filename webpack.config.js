const path = require('path');

/** @type {import('webpack').Configuration} */
const extensionConfig = {
  mode: 'development',
  target: 'node',
  entry: {
    extension: './src/extension.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
                configFile: 'tsconfig.json'
            }
          },
        ],
      },
    ],
  },
  devtool: 'nosources-source-map',
};

module.exports = [extensionConfig];
