<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>User Management</span>
          <el-input
            v-model="searchQuery"
            placeholder="Search users..."
            style="width: 200px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="filteredUsers"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="Username" />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="createTime" label="Create Time" />
        <el-table-column label="Operations" width="150">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { HttpManager } from '../api'

const loading = ref(false)
const users = ref([])
const searchQuery = ref('')

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await HttpManager.getAllUser()
    if (res.data.code === 200) {
      users.value = res.data.data
    } else {
      ElMessage.error('Failed to fetch users')
    }
  } catch (error) {
    ElMessage.error('Failed to fetch users')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete user ${user.username}?`,
      'Warning',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    
    const res = await HttpManager.deleteUser(user.id)
    if (res.data.code === 200) {
      ElMessage.success('User deleted successfully')
      fetchUsers()
    } else {
      ElMessage.error('Failed to delete user')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete user')
    }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 