<template>
  <el-card style="max-width:400px;margin:60px auto;">
    <template #header>
      <div class="card-header">
        <h2>用户注册</h2>
      </div>
    </template>
    <el-form 
      :model="form" 
      :rules="rules" 
      ref="formRef" 
      label-width="80px"
      @submit.prevent="onRegister"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input 
          v-model="form.password" 
          type="password" 
          placeholder="请输入密码"
          show-password 
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="请再次输入密码"
          show-password 
        />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="form.sex" placeholder="请选择性别">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="phoneNum">
        <el-input v-model="form.phoneNum" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="生日" prop="birth">
        <el-date-picker 
          v-model="form.birth" 
          type="date" 
          placeholder="请选择生日"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="简介" prop="introduction">
        <el-input 
          v-model="form.introduction" 
          type="textarea" 
          :rows="3"
          placeholder="请输入个人简介" 
        />
      </el-form-item>
      <el-form-item label="地区" prop="location">
        <el-input v-model="form.location" placeholder="请输入所在地区" />
      </el-form-item>
      <el-form-item>
        <el-button 
          type="primary" 
          @click="onRegister" 
          style="width:100%;"
          :loading="loading"
        >
          注册
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-link @click="goLogin">已有账号？去登录</el-link>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { HttpManager } from '../api/HttpManager'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  sex: '',
  phoneNum: '',
  email: '',
  birth: '',
  introduction: '',
  location: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (form.value.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (value && !emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (value && !phoneRegex.test(value)) {
    callback(new Error('请输入有效的手机号码'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phoneNum: [
    { validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  birth: [
    { required: true, message: '请选择生日', trigger: 'change' }
  ]
}

const onRegister = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 移除确认密码字段
    const { confirmPassword, ...registerData } = form.value
    
    const res = await HttpManager.SignUp(registerData)
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } else {
      ElMessage.error(res.msg || '注册失败')
    }
  } catch (error) {
    console.error('Registration error:', error)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('注册失败，请检查表单信息')
    }
  } finally {
    loading.value = false
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.card-header {
  text-align: center;
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.el-form-item:last-child {
  margin-bottom: 0;
}
</style> 