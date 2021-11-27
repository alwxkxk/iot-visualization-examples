const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    "global_setting":'./src/common/global_setting.ts',
    index:'./src/index.ts',
    global:'./src/global.ts',
    edifice:'./src/edifice.ts'
  },
  devtool: 'inline-source-map',
  plugins: [
    new CopyPlugin({
      patterns:[
        {from:'./static/**/*'}
      ]
    }),
    new HtmlWebpackPlugin({
      filename:"index.html",
      template:'./src/index.html',
      chunks:['index']
    }),
    new HtmlWebpackPlugin({
      filename:"edifice.html",
      template:'./src/edifice.html',
      chunks:["edifice"]
    }),
    new HtmlWebpackPlugin({
      filename:"global.html",
      template:'./src/global.html',
      chunks:["global"]
    }),
  ],
  mode:"development",//production or development
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  watchOptions:{
    poll:1000,
    aggregateTimeout:1000,
    ignored:/node_modules/,
  }
};