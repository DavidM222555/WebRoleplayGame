const express = require('express');
const webpack = require('webpack');
const dotenv = require('dotenv');
const path = require('path');
const webpackDevMiddleware = require('webpack-dev-middleware');
dotenv.config()

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  })
);
app.use('/*', (_req, res) => {
  res.sendFile(path.resolve(__dirname + "/public/index.html"));
});

app.listen(8080, async() => {
  console.log(`Server running on port 8080`);
});