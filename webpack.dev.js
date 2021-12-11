const path = require('path');
const config = require('./webpack.config.js')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const devConfig = {
  ...config,
  cache: {
    type: 'filesystem',
    memoryCacheUnaffected: true,
  },
  devtool: 'eval',
  plugins:[
    ...config.plugins,
    new BundleAnalyzerPlugin()
  ],
  devServer: {
    static: './dist',
    hot:true,
    open:true,
    watchFiles: ['src/**/*'],
  },
  // BUG: devServer dont support aggregateTimeout
  // https://stackoverflow.com/questions/48872929/webpack-dev-server-watch-options-aggregatetimout-does-not-work
  // https://github.com/webpack/webpack-dev-server/issues/1782
  watch:true,
  watchOptions:{
    poll:1000,
    aggregateTimeout:2000,
    ignored:/node_modules/,
  },
  mode:"development",//production or development
}

module.exports =devConfig;