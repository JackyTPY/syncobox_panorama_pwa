import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: "/Panorama/view/:id/:refreshToken",
    name: "PanoramaViewer",
    component: () =>
        import ( /* webpackChunkName: "about" */ "../views/PanoViewPage.vue")
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

export default router
