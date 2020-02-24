import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: "/view/:shareCode",
    name: "PanoramaViewer",
    component: () =>
        import ( /* webpackChunkName: "about" */ "../views/PanoViewPage.vue")
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
