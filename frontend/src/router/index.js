import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import SongList from '../views/SongList.vue'
import SongListDetail from '../views/SongListDetail.vue'
import Singer from '../views/Singer.vue'
import UserCenter from '../views/UserCenter.vue'
import SongDetail from '../views/SongDetail.vue'
import SingerDetail from '../views/SingerDetail.vue'
import RankingList from '../views/RankingList.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/song-list', component: SongList },
  { path: '/song-list/:id', component: SongListDetail },
  { path: '/singer', component: Singer },
  { path: '/singer/:id', component: SingerDetail },
  { path: '/song/:id', component: SongDetail },
  { path: '/user', component: UserCenter },
  {
    path: '/ranking',
    name: 'RankingList',
    component: RankingList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 