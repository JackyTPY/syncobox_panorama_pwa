import Vue from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import KrpanoVue from 'krpano-vue'
import VueAnalytics from 'vue-analytics'
import vuetify from './plugins/vuetify';

var production = process.env.NODE_ENV == 'production'

Vue.use(KrpanoVue);

Vue.use(VueAnalytics, {
  id: 'UA-161417188-1',
  router,
  debug: {
    enabled: !production,
    sendHitTask: production
  },
  autoTracking: {
    pageviewOnLoad: false
  }
})

Vue.config.productionTip = false

new Vue({
  router,
  i18n,
  vuetify,
  render: h => h(App)
}).$mount('#app')
