module.exports = {
  entry: './src/bridge.js',
  output: {
    filename: 'index.js',
    path: './dist'
  },
  module: {
    loaders: [{
      test: /\.json$/,
      loader: 'json'
    }]
  }
};
