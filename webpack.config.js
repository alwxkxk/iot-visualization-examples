const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index:'./src/index.ts',
    t2:'./src/t2.ts'
  },
  plugins: [
    new CopyPlugin([{
      from: './src/*.html',
      to: "[name].[ext]",
    }])
  ],
  mode:"development",//production or development
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
};