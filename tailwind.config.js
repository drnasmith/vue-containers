module.exports = {
  /*
  Tailwind can remove some of its generated classes
  We are using purgecss as well but this still helps
  */
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
  // Adding a prefix so its clear where we are overriding styles
  plugins: []
}
