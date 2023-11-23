import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import PerlinNoiseView from '../views/PerlinNoiseView.vue'
import SineWavesView from '../views/SineWavesView.vue'

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 }
  },
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AboutView
    },
    {
      path: '/perlin-noise',
      name: 'perlin-noise',
      component: PerlinNoiseView
    },
    {
      path: '/sine-waves',
      name: 'sine-waves',
      component: SineWavesView
    }
  ]
})

export default router
