import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './pages/LoginPage.vue'
import CalculatorPage from './pages/CalculatorPage.vue'

const STORAGE_PREFIX = 'jewelryCalc.'
const CURRENT_USER_KEY = STORAGE_PREFIX + 'currentUser'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/calculator',
      name: 'calculator',
      component: CalculatorPage,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem(CURRENT_USER_KEY)

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.name === 'login' && isAuthenticated) {
    next({ name: 'calculator' })
    return
  }

  next()
})

export default router

