<template>
  <div class="songs-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Song Management</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              Add New Song
            </el-button>
            <el-input
              v-model="searchQuery"
              placeholder="Search songs..."
              style="width: 200px; margin-left: 10px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="filteredSongs"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="Cover" width="100">
          <template #default="{ row }">
            <el-image
              style="width: 50px; height: 50px"
              :src="row.pic ? HttpManager.attachImageUrl(row.pic) : '/default-cover.png'"
              :preview-src-list="row.pic ? [HttpManager.attachImageUrl(row.pic)] : []"
              fit="cover"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="singerName" label="Singer" />
        <el-table-column prop="introduction" label="Introduction" show-overflow-tooltip />
        <el-table-column label="Operations" width="380">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              Edit
            </el-button>
            <el-upload
              class="upload-demo"
              :action="`${baseURL}/${HttpManager.updateSongUrl(row.id)}`"
              :show-file-list="false"
              :on-success="(res) => handleUploadSuccess(res, row)"
              :on-error="handleUploadError"
              :before-upload="beforeMusicUpload"
            >
              <el-button type="success" size="small">Upload Music</el-button>
            </el-upload>
            <el-upload
              class="upload-demo"
              :action="`${baseURL}/${HttpManager.updateSongImg(row.id)}`"
              :show-file-list="false"
              :on-success="(res) => handleImageUploadSuccess(res, row)"
              :on-error="handleUploadError"
              :before-upload="beforeImageUpload"
              name="file"
            >
              <el-button type="warning" size="small">Upload Image</el-button>
            </el-upload>
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

    <!-- Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit Song' : 'Add New Song'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="Singer ID" prop="singerId">
          <el-input v-model="editForm.singerId" />
        </el-form-item>
        <el-form-item label="Introduction" prop="introduction">
          <el-input
            v-model="editForm.introduction"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="Lyric" prop="lyric">
          <el-input
            v-model="editForm.lyric"
            type="textarea"
            :rows="5"
          />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="Music File" prop="musicFile">
          <el-upload
            class="upload-demo"
            :action="`${baseURL}/${uploadUrl}`"
            :show-file-list="false"
            :on-success="handleMusicUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeMusicUpload"
          >
            <el-button type="primary">Upload Music</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="Cover Image" prop="imageFile">
          <el-upload
            class="upload-demo"
            :action="`${baseURL}/${HttpManager.updateSongImg('')}`"
            :show-file-list="false"
            :on-success="handleNewImageUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeImageUpload"
            name="file"
          >
            <el-button type="primary">Upload Image</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            {{ isEdit ? 'Save' : 'Create' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Picture } from '@element-plus/icons-vue'
import { HttpManager } from '../api'

const baseURL = 'http://localhost:8888'
const loading = ref(false)
const saving = ref(false)
const songs = ref([])
const searchQuery = ref('')
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const uploadUrl = ref('')

const editForm = ref({
  id: '',
  name: '',
  singerId: '',
  introduction: '',
  lyric: ''
})

const rules = {
  name: [{ required: true, message: 'Please input song name', trigger: 'blur' }],
  singerId: [{ required: true, message: 'Please input singer ID', trigger: 'blur' }]
}

const filteredSongs = computed(() => {
  if (!searchQuery.value) return songs.value
  const query = searchQuery.value.toLowerCase()
  return songs.value.filter(song => 
    song.name.toLowerCase().includes(query) ||
    song.singerName.toLowerCase().includes(query)
  )
})

const fetchSongs = async () => {
  loading.value = true
  try {
    const res = await HttpManager.getAllSong()
    if (res.data.code === 200) {
      songs.value = res.data.data
    } else {
      ElMessage.error('Failed to fetch songs')
    }
  } catch (error) {
    ElMessage.error('Failed to fetch songs')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  editForm.value = {
    id: '',
    name: '',
    singerId: '',
    introduction: '',
    lyric: ''
  }
  uploadUrl.value = HttpManager.updateSongUrl('')
  dialogVisible.value = true
}

const handleEdit = (song) => {
  isEdit.value = true
  editForm.value = { ...song }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const res = await HttpManager.updateSongMsg(editForm.value)
        if (res.data.code === 200) {
          ElMessage.success(isEdit.value ? 'Song updated successfully' : 'Song created successfully')
          dialogVisible.value = false
          fetchSongs()
        } else {
          ElMessage.error(isEdit.value ? 'Failed to update song' : 'Failed to create song')
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? 'Failed to update song' : 'Failed to create song')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleDelete = async (song) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete song ${song.name}?`,
      'Warning',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    
    const res = await HttpManager.deleteSong(song.id)
    if (res.data.code === 200) {
      ElMessage.success('Song deleted successfully')
      fetchSongs()
    } else {
      ElMessage.error('Failed to delete song')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete song')
    }
  }
}

const beforeMusicUpload = (file) => {
  const isAudio = file.type.startsWith('audio/')
  if (!isAudio) {
    ElMessage.error('Please upload an audio file!')
    return false
  }
  return true
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('Please upload an image file!')
    return false
  }
  return true
}

const handleMusicUploadSuccess = (res) => {
  if (res.code === 200) {
    ElMessage.success('Music uploaded successfully')
    fetchSongs()
  } else {
    ElMessage.error(res.message || 'Failed to upload music')
  }
}

const handleImageUploadSuccess = (res, song) => {
  if (res.code === 200) {
    ElMessage.success(`Image uploaded successfully for ${song.name}`)
    const index = songs.value.findIndex(s => s.id === song.id)
    if (index !== -1) {
      songs.value[index] = { ...songs.value[index], pic: res.data }
    }
  } else {
    ElMessage.error(res.message || 'Failed to upload image')
  }
}

const handleNewImageUploadSuccess = (res) => {
  if (res.code === 200) {
    ElMessage.success('Image uploaded successfully')
    editForm.value.pic = res.data
  } else {
    ElMessage.error(res.message || 'Failed to upload image')
  }
}

const handleUploadSuccess = (res, song) => {
  if (res.code === 200) {
    ElMessage.success(`Music uploaded successfully for ${song.name}`)
    fetchSongs()
  } else {
    ElMessage.error(res.message || 'Failed to upload music')
  }
}

const handleUploadError = (error) => {
  console.error('Upload error:', error)
  ElMessage.error('Failed to upload file. Please try again.')
}

onMounted(() => {
  fetchSongs()
})
</script>

<style scoped>
.songs-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.upload-demo {
  display: inline-block;
  margin: 0 5px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}
</style> 