// postcss.config.js
const path = require('path');

module.exports = ({env}) => (
  {
    plugins: [
      require('tailwindcss'),
      require('autoprefixer'),
    ]
  }
)
