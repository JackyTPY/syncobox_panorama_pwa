import Vue from 'vue'
import VueRouter from 'vue-router'
import { vuexOidcCreateRouterMiddleware } from 'vuex-oidc'
import store from '@/store/index'

Vue.use(VueRouter)

const routes = [
  {
    path: "/view/:id",
    name: "PanoramaViewer",
    component: () =>
        import ( /* webpackChunkName: "about" */ "../views/PanoViewPage.vue")
  },
  {
    path: "/callback",
    name: "OidcCallback",
    component: () =>
        import ( /* webpackChunkName: "about" */ "../views/OidcCallback.vue")
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
router.beforeEach(vuexOidcCreateRouterMiddleware(store))

export default router
