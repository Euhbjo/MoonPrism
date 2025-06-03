<template>
  <el-card>
    <h2>{{ songList.title }}</h2>
    <img :src="HttpManager.attachImageUrl(songList.pic)" style="width:200px;">
    <p>{{ songList.introduction }}</p>
    <el-tooltip :content="isListCollected ? '取消收藏' : '收藏'" placement="top">
      <el-button 
        circle
        size="small" 
        :type="isListCollected ? 'danger' : 'primary'"
        @click="toggleListCollect"
      >
        <el-icon><Star /></el-icon>
      </el-button>
    </el-tooltip>
    <el-divider>歌曲列表</el-divider>
    <el-table :data="songs.flat(2)" style="width:100%">
      <el-table-column label="歌曲名">
        <template #default="scope">
          {{ extractSongTitle(scope.row.name) }}
        </template>
      </el-table-column>
      <el-table-column label="歌手">
        <template #default="scope">
          {{ extractSingerName(scope.row.name) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-tooltip content="播放" placement="top">
            <el-button circle size="small" @click="play(scope.row)">
              <el-icon><VideoPlay /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="下载" placement="top">
            <el-button circle size="small" type="success" @click="downloadSong(scope.row)" :loading="scope.row.downloading">
              <el-icon><Download /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="详情" placement="top">
            <el-button circle size="small" @click="goSongDetail(scope.row.id)">
              <el-icon><InfoFilled /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="isCollected(scope.row.id) ? '取消收藏' : '收藏'" placement="top">
            <el-button 
              circle
              size="small" 
              :type="isCollected(scope.row.id) ? 'danger' : 'primary'"
              @click="toggleCollect(scope.row)"
            >
              <el-icon><Star /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-divider>评论区</el-divider>
    <el-form :model="commentForm" inline @submit.prevent>
      <el-form-item>
        <el-input v-model="commentForm.content" placeholder="写下你的评论..." style="width:300px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitComment">发表评论</el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-card v-for="item in comments" :key="item.id" style="margin-bottom: 12px;">
        <el-row style="width:100%">
          <el-col :span="20">
            <b>{{ item.userName || '用户' }}</b>：{{ item.content }}
            <div style="font-size:12px;color:#888;">{{ formatDate(item.createTime) }}</div>
          </el-col>
          <el-col :span="4" style="text-align:right;">
            <el-button size="small" @click="likeComment(item)">👍 {{ item.up || 0 }}</el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HttpManager } from '../api/HttpManager'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '../store/player'
import { VideoPlay, InfoFilled, Star, Download } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const playerStore = usePlayerStore()
const songList = ref({})
const songs = ref([])
const comments = ref([])
const commentForm = ref({ content: '' })
const collectedSongs = ref(new Set()) // 用于存储已收藏的歌曲ID
const isListCollected = ref(false) // 用于存储歌单收藏状态

onMounted(async () => {
  const id = route.params.id
  const res = await HttpManager.getSongList()
  const listArr = Array.isArray(res) ? res : (res.data || [])
  songList.value = listArr.find(item => item.id == id) || {}
  const res2 = await HttpManager.getSongListOfSongId(id)
  for(let i = 0; i < res2.data.length; i++) {
    const song = await HttpManager.getSongOfId(res2.data[i].songId)
    songs.value.push(song.data)
  }
  await loadComments()
  await loadCollections() // 加载用户的收藏状态
  await checkListCollection() // 检查歌单收藏状态
})

async function loadComments() {
  const id = route.params.id
  const res = await HttpManager.getAllComment(1, id)
  const commentsData = Array.isArray(res) ? res : (res.data || [])
  
  // 获取所有评论的用户信息
  const commentsWithUserInfo = await Promise.all(
    commentsData.map(async (comment) => {
      try {
        const userRes = await HttpManager.getUserOfId(comment.userId)
        const userData = Array.isArray(userRes) ? userRes[0] : (userRes.data ? userRes.data[0] : null)
        return {
          ...comment,
          userName: userData ? userData.username : '未知用户'
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return {
          ...comment,
          userName: '未知用户'
        }
      }
    })
  )
  
  comments.value = commentsWithUserInfo
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
    songId: null,
    songListId: route.params.id,
    nowType: 1
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

function play(song) {
  if (song.url) {
    const songWithFullUrl = {
      ...song,
      url: HttpManager.attachImageUrl(song.url)
    }
    playerStore.setCurrentSong(songWithFullUrl)
    playerStore.setPlaylist(songs.value.map(s => ({
      ...s,
      url: HttpManager.attachImageUrl(s.url)
    })))
  } else {
    ElMessage.info('该歌曲暂无音频资源')
  }
}

// 获取歌曲名
function extractSongTitle(name) {
  const parts = name.split("-");
  return parts.length > 1 ? parts[1].trim() : name.trim();
}

// 获取歌手名
function extractSingerName(name) {
  const parts = name.split("-");
  return parts.length > 1 ? parts[0].trim() : "未知歌手";
}

// 加载用户的收藏状态
async function loadCollections() {
  if (!userStore.user) return
  
  try {
    const res = await HttpManager.getCollectionOfUser(userStore.user.id)
    if (res && res.code === 200) {
      const collections = Array.isArray(res.data) ? res.data : []
      // 将收藏的歌曲ID添加到Set中
      collections
        .filter(item => item.type === 0)
        .forEach(item => collectedSongs.value.add(item.songId))
      
      // 检查当前歌单是否被收藏
      const listCollection = collections.find(item => 
        item.type === 1 && item.songListId === Number(route.params.id)
      )
      isListCollected.value = !!listCollection
    }
  } catch (error) {
    console.error('加载收藏状态失败:', error)
  }
}

// 检查歌曲是否已收藏
function isCollected(songId) {
  return collectedSongs.value.has(songId)
}

// 切换收藏状态
async function toggleCollect(song) {
  if (!userStore.user) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isCollected(song.id)) {
      // 取消收藏
      await HttpManager.deleteCollection(userStore.user.id, song.id)
      collectedSongs.value.delete(song.id)
      ElMessage.success('已取消收藏')
    } else {
      // 添加收藏
      await HttpManager.setCollection({
        userId: userStore.user.id,
        type: 0,
        songId: song.id
      })
      collectedSongs.value.add(song.id)
      ElMessage.success('已收藏')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 跳转到歌曲详情页
function goSongDetail(id) {
  router.push(`/song/${id}`)
}

async function downloadSong(song) {
  if (!song.url) {
    ElMessage.warning('该歌曲暂无音频资源')
    return
  }

  try {
    song.downloading = true
    const response = await HttpManager.downloadMusic(song.url)
    
    // 创建Blob对象
    const blob = new Blob([response], { type: 'audio/mpeg' })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 设置文件名（使用歌曲名作为文件名）
    const fileName = `${song.name}.mp3`
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
    song.downloading = false
  }
}

// 格式化日期
function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(Number(timestamp))
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 检查歌单收藏状态
async function checkListCollection() {
  if (!userStore.user) return
  
  try {
    const res = await HttpManager.isCollection({
      userId: userStore.user.id,
      type: 1,
      songListId: route.params.id
    })
    isListCollected.value = res.code === 1
  } catch (error) {
    console.error('检查歌单收藏状态失败:', error)
  }
}

// 切换歌单收藏状态
async function toggleListCollect() {
  if (!userStore.user) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isListCollected.value) {
      // 取消收藏
      await HttpManager.deleteCollection(userStore.user.id, route.params.id)
      isListCollected.value = false
      ElMessage.success('已取消收藏')
    } else {
      // 添加收藏
      await HttpManager.setCollection({
        userId: userStore.user.id,
        type: 1,
        songListId: route.params.id
      })
      isListCollected.value = true
      ElMessage.success('已收藏')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败')
  }
}

</script> 