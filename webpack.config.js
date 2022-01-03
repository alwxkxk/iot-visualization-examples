const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin')
const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer') // help tailwindcss to work

module.exports = {
  entry: {
    index: './src/index.ts'
    // global:'./src/global.ts',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './static/**/*' }
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      favicon: './static/favicon.ico',
      chunks: ['index']
    }),
    // new HtmlWebpackPlugin({
    //   filename:"global.html",
    //   template:'./src/global.html',
    //   chunks:["global"]
    // })
    new HtmlWebpackTagsPlugin({ tags: ['/static/bootstrap.min.css'], append: true })
  ],
  mode: 'production', // production or development
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader', // postcss loader needed for tailwindcss
            options: {
              postcssOptions: {
                ident: 'postcss',
                plugins: [tailwindcss, autoprefixer]
              }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}
