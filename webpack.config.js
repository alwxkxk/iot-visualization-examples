const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    "global-variable":'./src/common/global-variable.ts',
    index:'./src/index.ts',
    t2:'./src/t2.ts',
  },
  plugins: [
    new CopyPlugin([{
      from: './src/*.html',
      to: "[name].[ext]",
    },{
      from:'./static/**/*'
    }])
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
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
};