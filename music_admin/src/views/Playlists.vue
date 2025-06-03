<template>
  <div class="playlists-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Playlist Management</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              Add New Playlist
            </el-button>
            <el-input
              v-model="searchQuery"
              placeholder="Search playlists..."
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
        :data="filteredPlaylists"
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
        <el-table-column prop="title" label="Title" />
        <el-table-column prop="style" label="Style" />
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
              :action="`${baseURL}/${HttpManager.updatePlaylistImg(row.id)}`"
              :show-file-list="false"
              :on-success="(res) => handleImageUploadSuccess(res, row)"
              :on-error="handleUploadError"
              :before-upload="beforeImageUpload"
              name="file"
            >
              <el-button type="warning" size="small">Upload Image</el-button>
            </el-upload>
            <el-button
              type="success"
              size="small"
              @click="handleManageSongs(row)"
            >
              Manage Songs
            </el-button>
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
      :title="isEdit ? 'Edit Playlist' : 'Add New Playlist'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="Title" prop="title">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="Style" prop="style">
          <el-input v-model="editForm.style" />
        </el-form-item>
        <el-form-item label="Introduction" prop="introduction">
          <el-input
            v-model="editForm.introduction"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="Cover Image" prop="imageFile">
          <el-upload
            class="upload-demo"
            :action="`${baseURL}/${HttpManager.updatePlaylistImg('')}`"
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

    <!-- Manage Songs Dialog -->
    <el-dialog
      v-model="songsDialogVisible"
      title="Manage Songs"
      width="800px"
    >
      <div class="songs-management">
        <div class="songs-list">
          <h3>Current Songs</h3>
          <el-table :data="currentPlaylistSongs" style="width: 100%">
            <el-table-column prop="name" label="Song Name" />
            <el-table-column prop="singerName" label="Singer" />
            <el-table-column label="Operations" width="120">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  size="small"
                  @click="handleRemoveSong(row)"
                >
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="add-songs">
          <h3>Add Songs</h3>
          <el-input
            v-model="songSearchQuery"
            placeholder="Search songs..."
            style="width: 200px; margin-bottom: 10px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-table :data="filteredAvailableSongs" style="width: 100%">
            <el-table-column prop="name" label="Song Name" />
            <el-table-column prop="singerName" label="Singer" />
            <el-table-column label="Operations" width="120">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleAddSong(row)"
                >
                  Add
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
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
const playlists = ref([])
const searchQuery = ref('')
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

const editForm = ref({
  id: '',
  title: '',
  style: '',
  introduction: ''
})

const rules = {
  title: [{ required: true, message: 'Please input playlist title', trigger: 'blur' }],
  style: [{ required: true, message: 'Please input playlist style', trigger: 'blur' }]
}

const filteredPlaylists = computed(() => {
  if (!searchQuery.value) return playlists.value
  const query = searchQuery.value.toLowerCase()
  return playlists.value.filter(playlist => 
    playlist.title.toLowerCase().includes(query) ||
    playlist.style.toLowerCase().includes(query)
  )
})

const fetchPlaylists = async () => {
  loading.value = true
  try {
    const res = await HttpManager.getAllPlaylist()
    if (res.data.code === 200) {
      playlists.value = res.data.data
    } else {
      ElMessage.error('Failed to fetch playlists')
    }
  } catch (error) {
    ElMessage.error('Failed to fetch playlists')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  editForm.value = {
    id: '',
    title: '',
    style: '',
    introduction: ''
  }
  dialogVisible.value = true
}

const handleEdit = (playlist) => {
  isEdit.value = true
  editForm.value = { ...playlist }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        const res = isEdit.value
          ? await HttpManager.updatePlaylistMsg(editForm.value)
          : await HttpManager.addPlaylist(editForm.value)
        
        if (res.data.code === 200) {
          ElMessage.success(isEdit.value ? 'Playlist updated successfully' : 'Playlist created successfully')
          dialogVisible.value = false
          fetchPlaylists()
        } else {
          ElMessage.error(isEdit.value ? 'Failed to update playlist' : 'Failed to create playlist')
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? 'Failed to update playlist' : 'Failed to create playlist')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleDelete = async (playlist) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete playlist ${playlist.title}?`,
      'Warning',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    
    const res = await HttpManager.deletePlaylist(playlist.id)
    if (res.data.code === 200) {
      ElMessage.success('Playlist deleted successfully')
      fetchPlaylists()
    } else {
      ElMessage.error('Failed to delete playlist')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete playlist')
    }
  }
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('Please upload an image file!')
    return false
  }
  return true
}

const handleImageUploadSuccess = (res, playlist) => {
  if (res.code === 200) {
    ElMessage.success(`Image uploaded successfully for ${playlist.title}`)
    const index = playlists.value.findIndex(p => p.id === playlist.id)
    if (index !== -1) {
      playlists.value[index] = { ...playlists.value[index], pic: res.data }
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

const handleUploadError = (error) => {
  console.error('Upload error:', error)
  ElMessage.error('Failed to upload file. Please try again.')
}

// 歌单歌曲管理
const songsDialogVisible = ref(false)
const currentPlaylist = ref(null)
const currentPlaylistSongs = ref([])
const allSongs = ref([])
const songSearchQuery = ref('')

const filteredAvailableSongs = computed(() => {
  if (!songSearchQuery.value) return allSongs.value
  const query = songSearchQuery.value.toLowerCase()
  return allSongs.value.filter(song => 
    song.name.toLowerCase().includes(query) ||
    song.singerName.toLowerCase().includes(query)
  )
})

const handleManageSongs = async (playlist) => {
  currentPlaylist.value = playlist
  songsDialogVisible.value = true
  
  try {
    const [playlistRes, songsRes] = await Promise.all([
      HttpManager.getPlaylistSongs(playlist.id),
      HttpManager.getAllSong()
    ])
    
    if (playlistRes.data.code === 200) {
      currentPlaylistSongs.value = playlistRes.data.data || []
    }
    if (songsRes.data.code === 200) {
      allSongs.value = songsRes.data.data
    }
  } catch (error) {
    ElMessage.error('Failed to load songs data')
  }
}

const handleAddSong = async (song) => {
  try {
    const res = await HttpManager.addPlaylistSong({
      songId: song.id,
      songListId: currentPlaylist.value.id
    })
    if (res.data.code === 200) {
      ElMessage.success('Song added to playlist')
      currentPlaylistSongs.value.push(song)
    } else {
      ElMessage.error('Failed to add song to playlist')
    }
  } catch (error) {
    ElMessage.error('Failed to add song to playlist')
  }
}

const handleRemoveSong = async (song) => {
  try {
    const res = await HttpManager.deletePlaylistSong(song.id)
    if (res.data.code === 200) {
      ElMessage.success('Song removed from playlist')
      currentPlaylistSongs.value = currentPlaylistSongs.value.filter(s => s.id !== song.id)
    } else {
      ElMessage.error('Failed to remove song from playlist')
    }
  } catch (error) {
    ElMessage.error('Failed to remove song from playlist')
  }
}

onMounted(() => {
  fetchPlaylists()
})
</script>

<style scoped>
.playlists-container {
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

.songs-management {
  display: flex;
  gap: 20px;
}

.songs-list,
.add-songs {
  flex: 1;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
}
</style> 