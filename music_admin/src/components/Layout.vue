<template>
  <el-container>
    <el-aside width="200px">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-vertical"
        @select="handleSelect"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <span>Users</span>
        </el-menu-item>
        <el-menu-item index="/songs">
          <el-icon><Headset /></el-icon>
          <span>Songs</span>
        </el-menu-item>
        <el-menu-item index="/playlists">
          <el-icon><List /></el-icon>
          <span>Playlists</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-content">
          <h2>Music Admin System</h2>
          <el-button type="danger" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Headset, List, House } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const activeIndex = ref('/')

const handleSelect = (key) => {
  router.push(key)
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to logout?',
      'Warning',
      {
        confirmButtonText: 'Logout',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    localStorage.removeItem('admin-token')
    router.push('/login')
  } catch {
    // User cancelled logout
  }
}
</script>

<style scoped>
.el-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.el-menu-vertical {
  height: 100%;
}

.el-menu-item {
  display: flex;
  align-items: center;
}

.el-icon {
  margin-right: 8px;
}
</style> 