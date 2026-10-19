// postcss.config.cjs
module.exports = {
  plugins: [
    require('@tailwindcss/postcss')(), // ✅ NEW plugin
    require('autoprefixer')()
  ],
};