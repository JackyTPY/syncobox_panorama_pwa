module.exports = {
  // ...other vue-cli plugin options...
  pwa: {
    appleMobileWebAppCapable: 'yes',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
    }
  },

  pluginOptions: {
    i18n: {
      locale: 'zh-TW',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  }
}
