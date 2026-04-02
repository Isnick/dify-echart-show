import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/chart',
      component: () => import('../views/Chart.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/chart'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !getToken()) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && getToken()) {
    next('/chart')
  } else {
    next()
  }
})

export default router
