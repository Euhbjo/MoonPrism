import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import Songs from '../views/Songs.vue'
import Playlists from '../views/Playlists.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'users',
        name: 'Users',
        component: Users
      },
      {
        path: 'songs',
        name: 'Songs',
        component: Songs
      },
      {
        path: 'playlists',
        name: 'Playlists',
        component: Playlists
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('admin-token')
  if (to.path !== '/login' && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router 