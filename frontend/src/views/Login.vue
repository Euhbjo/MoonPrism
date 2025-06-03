<template>
  <el-card style="max-width:400px;margin:60px auto;">
    <el-form :model="loginForm" :rules="rules" ref="loginFormRef" @submit.prevent="onLogin">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="loginForm.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="loginForm.password" type="password" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onLogin" style="width:100%;" :loading="loading">登录</el-button>
      </el-form-item>
      <el-form-item>
        <el-link @click="goRegister">没有账号？去注册</el-link>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { HttpManager } from '../api/HttpManager'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)
const loginForm = ref({ username: '', password: '' })

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const onLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const res = await HttpManager.signIn(loginForm.value)
    console.log('Login response:', res)
    
    if (res && res.code === 200) {
      // 处理用户数据
      const userData = {
        id: res.data[0].id,
        username: res.data[0].username,
        password: res.data[0].password,
        sex: res.data[0].sex,
        phoneNum: res.data[0].phoneNum,
        email: res.data[0].email,
        birth: res.data[0].birth,
        introduction: res.data[0].introduction,
        location: res.data[0].location,
        avatar: res.data[0].avator,
        createTime: res.data[0].createTime,
        updateTime: res.data[0].updateTime
      }
      
      console.log('Setting user data:', userData)
      userStore.setUser(userData)
      console.log('User data set:', userStore.user)
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(res?.msg || '登录失败')
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function goRegister() {
  router.push('/register')
}
</script> 