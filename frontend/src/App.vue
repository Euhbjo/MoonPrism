<template>
  <el-container>
    <el-header>
      <el-row align="middle" justify="space-between">
        <el-col :span="4">
          <img src="\src\public\cute.png" alt="logo" style="height:40px;">
          <span style="font-size:24px;color:#303133;margin-left:10px;">MoonPrism</span>
        </el-col>
        <el-col :span="16">
          <el-menu mode="horizontal" :default-active="activeMenu" @select="onMenuSelect">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/song-list">歌单</el-menu-item>
            <el-menu-item index="/singer">歌手</el-menu-item>
            <el-menu-item index="/ranking">排行榜</el-menu-item> 
            <el-menu-item index="/user">个人中心</el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="4" style="text-align:right;">
          <template v-if="user">
            <el-avatar :src="getBaseURL() + user.avatar || defaultAvatar" />
            <span style="margin:0 10px;">{{ user.username }}</span>
            <el-button size="small" @click="logout">退出</el-button>
          </template>
          <template v-else>
            <el-button size="small" @click="goLogin">登录</el-button>
            <el-button size="small" @click="goRegister">注册</el-button>
          </template>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <router-view />
      <AudioPlayer
        :currentSong="playerStore.currentSong"
        :playlist="playerStore.playlist"
        @update:currentSong="playerStore.setCurrentSong"
      />
    </el-main>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './store/user'
import { computed } from 'vue'
import { getBaseURL } from './api/request'
import { usePlayerStore } from './store/player'
import AudioPlayer from './components/AudioPlayer.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const playerStore = usePlayerStore()
const user = computed(() => userStore.user)
const defaultAvatar = 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'

const activeMenu = computed(() => {
  if (route.path.startsWith('/song-list')) return '/song-list'
  if (route.path.startsWith('/singer')) return '/singer'
  if (route.path.startsWith('/user')) return '/user'
  return '/'
})

function onMenuSelect(index) {
  router.push(index)
}
function goLogin() {
  router.push('/login')
}
function goRegister() {
  router.push('/register')
}
function logout() {
  userStore.logout()
  router.push('/')
}
</script> 

<style>
.el-header {
  background: #fff;
  box-shadow: 0 2px 8px #f0f1f2;
  padding: 0 20px;
}

.el-main {
  padding-bottom: 80px; /* 为底部播放器留出空间 */
}

/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style> 