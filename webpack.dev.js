const path = require('path');
const config = require('./webpack.config.js')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const devConfig = {
  ...config,
  devtool: 'eval',
  plugins:[
    ...config.plugins,
    new BundleAnalyzerPlugin()
  ],
  devServer: {
    static: './dist',
    hot:true,
    open:true,
    watchFiles: ['src/**/*']
  },
  mode:"development",//production or development
}

module.exports =devConfig;