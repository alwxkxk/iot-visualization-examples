const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    "global_setting":'./src/common/global_setting.ts',
    index:'./src/index.ts',
    components:'./src/components.ts',
    sw:'./src/common/sw/sw.ts',
    test:'./src/test.ts',
    edifice:'./src/edifice.ts'
  },
  devtool: 'inline-source-map',
  plugins: [
    new CopyPlugin([{
      from:'./static/**/*'
    }]),
    new HtmlWebpackPlugin({
      filename:"index.html",
      template:'./src/index.html',
      inject:false,
      chunks:["global_setting","sw","index"]
    }),
    new HtmlWebpackPlugin({
      filename:"edifice.html",
      template:'./src/edifice.html',
      inject:false,
      chunks:["global_setting","sw","edifice"]
    }),
    new HtmlWebpackPlugin({
      filename:"test.html",
      template:'./src/test.html',
      inject:false,
      chunks:["global_setting","sw","test"]
    }),
    new HtmlWebpackPlugin({
      filename:"components.html",
      template:'./src/components.html',
      inject:false,
      chunks:["global_setting","sw","components"]
    })
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