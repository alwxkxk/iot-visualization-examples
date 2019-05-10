const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    "global_setting":'./src/common/global_setting.ts',
    index:'./src/index.ts',
    components:'./src/components.ts',
    sw:'./src/common/sw/sw.ts',
    test:'./src/test.ts',
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
  },
  watchOptions:{
    poll:1000,
    aggregateTimeout:1000,
    ignored:/node_modules/,
  }
};