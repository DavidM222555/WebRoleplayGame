const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');
const dotenv = require('dotenv');
dotenv.config()

module.exports = {
  mode: (process.env.NODE_ENV == "production" ?  "production" : "development"),
  entry: path.join(__dirname, "src/index.tsx"),
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].bundle.js",
    publicPath: "/",
  },
  devtool: (process.env.NODE_ENV == "production" ? 'source-map' : 'inline-source-map'),
  devServer: {
    static: './public'
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false,
      "os": false
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: "ts-loader",
      },
      {
        test: /\.(jpg|jpeg|png|gif|mp3|svg|ico)$/,
        exclude: /node_modules/,
        use: "file-loader?name=[name].[ext]",
      },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        loader: 'file-loader',
        options: {
            limit: 10000,
            name: '[name].[hash:7].[ext]'
        }
     }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public/base_index.html"),
      filename: "index.html",
      inject: "body"
    }),
    new DotenvPlugin()
  ]
}