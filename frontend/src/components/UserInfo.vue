<template>
  <div v-if="user">
    <el-avatar :src="getBaseURL()+user.avata" size="large" />
    <div>用户名：{{ user.username }}</div>
    <div>邮箱：{{ user.email }}</div>
    <div>手机号：{{ user.phoneNum }}</div>
    <div>性别：{{ user.sex }}</div>
    <div>地区：{{ user.location }}</div>
    <div>简介：{{ user.introduction }}</div>
    <el-button @click="logout">退出登录</el-button>
  </div>
  <div v-else>
    <el-alert title="请先登录" type="warning" />
  </div>
</template>

<script setup>
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { getBaseURL } from '../api/request'
const userStore = useUserStore()
const router = useRouter()
const user = computed(() => userStore.user)
const defaultAvatar = 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'
function logout() {
  userStore.logout()
  router.push('/login')
}
</script> 