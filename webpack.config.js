const path = require('path');

module.exports = {
  entry: './src/ignoreCase.js',
  output: {
    filename: 'ignoreCase.min.js',
    path: path.resolve(__dirname, 'dist'),
  },
};