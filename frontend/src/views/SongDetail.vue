<template>
  <el-card>
    <div class="song-header">
      <div class="song-info">
        <h2>{{ song.name }}</h2>
        <div>歌手：{{ song.singerName }}</div>
        <div>专辑：{{ song.album || '-' }}</div>
      </div>
      <div class="song-actions">
        <el-tooltip content="播放" placement="top">
          <el-button circle @click="playSong">
            <el-icon><VideoPlay /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="collected ? '取消收藏' : '收藏'" placement="top">
          <el-button circle :type="collected ? 'danger' : 'primary'" @click="toggleCollect">
            <el-icon><Star /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="下载" placement="top">
          <el-button circle type="success" @click="downloadSong" :loading="downloading">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <el-rate v-model="score" @change="rateSong" />
    <el-divider>评论区</el-divider>
    <el-form :model="commentForm" inline @submit.prevent>
      <el-form-item>
        <el-input v-model="commentForm.content" placeholder="写下你的评论..." style="width:300px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitComment">发表评论</el-button>
      </el-form-item>
    </el-form>
    <el-list>
      <el-list-item v-for="item in comments" :key="item.id">
        <el-row style="width:100%">
          <el-col :span="20">
            <b>{{ item.userName || '用户' }}</b>：{{ item.content }}
            <div style="font-size:12px;color:#888;">{{ item.createTime }}</div>
          </el-col>
          <el-col :span="4" style="text-align:right;">
            <el-button size="small" @click="likeComment(item)">👍 {{ item.up || 0 }}</el-button>
          </el-col>
        </el-row>
      </el-list-item>
    </el-list>
  </el-card>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { HttpManager } from '../api/HttpManager'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import { VideoPlay, Star, Download } from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()
const song = ref({})
const comments = ref([])
const commentForm = ref({ content: '' })
const collected = ref(false)
const score = ref(0)
const audioPlayer = inject('audioPlayer')
const downloading = ref(false)

onMounted(async () => {
  const id = route.params.id
  const res = await HttpManager.getSongOfId(id)
  song.value = Array.isArray(res) ? res[0] : (res.data ? res.data[0] : {})
  await loadComments()
  // 检查是否收藏
  if (userStore.user) {
    const colRes = await HttpManager.isCollection({ userId: userStore.user.id, type: 0, songId: id })
    collected.value = colRes.code === 1
    // 获取评分
    const rankRes = await HttpManager.getUserRank(userStore.user.id, null)
    score.value = rankRes.data ? rankRes.data.score : 0
  }
})

async function loadComments() {
  const id = route.params.id
  const res = await HttpManager.getAllComment(0, id)
  comments.value = Array.isArray(res) ? res : (res.data || [])
}

async function submitComment() {
  if (!userStore.user) {
    ElMessage.warning('请先登录')
    return
  }
  if (!commentForm.value.content) {
    ElMessage.warning('请输入评论内容')
    return
  }
  await HttpManager.setComment({
    userId: userStore.user.id,
    content: commentForm.value.content,
    songId: route.params.id,
    songListId: null,
    nowType: 0
  })
  ElMessage.success('评论成功')
  commentForm.value.content = ''
  await loadComments()
}

async function likeComment(item) {
  await HttpManager.setSupport({ id: item.id, up: (item.up || 0) + 1 })
  ElMessage.success('点赞成功')
  await loadComments()
}

async function toggleCollect() {
  if (!userStore.user) {
    ElMessage.warning('请先登录')
    return
  }
  if (collected.value) {
    await HttpManager.deleteCollection(userStore.user.id, song.value.id)
    collected.value = false
    ElMessage.success('已取消收藏')
  } else {
    await HttpManager.setCollection({ userId: userStore.user.id, type: 0, songId: song.value.id })
    collected.value = true
    ElMessage.success('已收藏')
  }
}

function playSong() {
  if (audioPlayer && song.value.url) {
    audioPlayer.playSong(HttpManager.attachImageUrl(song.value.url), song.value.name)
  } else {
    ElMessage.info('播放功能待实现')
  }
}

async function rateSong(val) {
  if (!userStore.user) {
    ElMessage.warning('请先登录')
    return
  }
  await HttpManager.setRank({ songListId: null, consumerId: userStore.user.id, score: val })
  ElMessage.success('评分成功')
}

async function downloadSong() {
  if (!song.value.url) {
    ElMessage.warning('该歌曲暂无音频资源')
    return
  }

  try {
    downloading.value = true
    const response = await HttpManager.downloadMusic(song.value.url)
    
    // 创建Blob对象
    const blob = new Blob([response], { type: 'audio/mpeg' })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 设置文件名（使用歌曲名作为文件名）
    const fileName = `${song.value.name}.mp3`
    link.setAttribute('download', fileName)
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.song-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.song-info {
  flex: 1;
}

.song-actions {
  display: flex;
  gap: 10px;
}

.song-actions .el-button {
  margin-left: 0;
}
</style> 