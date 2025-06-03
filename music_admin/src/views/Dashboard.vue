<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>Total Users</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ userCount }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>Total Songs</span>
              <el-icon><Headset /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ songCount }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>Total Singers</span>
              <el-icon><Microphone /></el-icon>
            </div>
          </template>
          <div class="stat-value">{{ singerCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>Recent Activities</span>
              <el-button type="primary" size="small" @click="fetchStats">
                <el-icon><Refresh /></el-icon>
                Refresh
              </el-button>
            </div>
          </template>
          <el-table :data="recentActivities" style="width: 100%">
            <el-table-column prop="type" label="Type" width="120" />
            <el-table-column prop="description" label="Description" />
            <el-table-column prop="time" label="Time" width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { User, Headset, Microphone, Refresh } from '@element-plus/icons-vue'
import { HttpManager } from '../api'

const userCount = ref(0)
const songCount = ref(0)
const singerCount = ref(0)
const recentActivities = ref([])
const loading = ref(false)

const fetchStats = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const [usersRes, songsRes, singersRes] = await Promise.all([
      HttpManager.getAllUser(),
      HttpManager.getAllSong(),
      HttpManager.getAllSinger()
     
    ])
    console.log(usersRes)
    if (usersRes.data.code === 200) {
      userCount.value = usersRes.data.data.length
    }
    if (songsRes.data.code === 200) {
      songCount.value = songsRes.data.data.length
    }
    if (singersRes.data.code === 200) {
      singerCount.value = singersRes.data.data.length
    }

    // 更新最近活动
    const now = new Date()
    recentActivities.value = [
      {
        type: 'Users',
        description: `Total users: ${userCount.value}`,
        time: now.toLocaleString()
      },
      {
        type: 'Songs',
        description: `Total songs: ${songCount.value}`,
        time: now.toLocaleString()
      },
      {
        type: 'Singers',
        description: `Total singers: ${singerCount.value}`,
        time: now.toLocaleString()
      }
    ]
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    loading.value = false
  }
}

// 定期刷新数据
onMounted(() => {
  fetchStats()
  // 每10秒刷新一次数据
  const timer = setInterval(fetchStats, 10000)
  
  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  height: 160px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
  color: #409EFF;
}
</style> 