import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: "/:shareCode",
    name: "PanoramaViewer",
    component: () =>
        import ( /* webpackChunkName: "about" */ "@/views/PanoViewPage.vue")
  },
  {
    name: '404',
    path: '/error/404notFound',
    component: () => import('@/views/Error404.vue')
  },
  {
    path: '*',
    redirect: '/error/404notFound'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
