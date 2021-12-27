const config = require('./webpack.config.js')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const devConfig = {
  ...config,
  cache: {
    type: 'filesystem',
    memoryCacheUnaffected: true
  },
  devtool: 'eval-source-map',
  plugins: [
    ...config.plugins,
    new BundleAnalyzerPlugin()
  ],
  devServer: {
    static: './dist',
    hot: true,
    open: true,
    watchFiles: {
      options: {
        awaitWriteFinish: {
          stabilityThreshold: 2000
        }
      },
      paths: ['src/**/*']
    }
  },
  mode: 'development' // production or development
}

module.exports = devConfig
