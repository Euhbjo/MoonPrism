<template>
  <div class="audio-player" :class="{ 'is-expanded': isExpanded }">
    <!-- 最小化状态 -->
    <div class="minimized-player" @click="toggleExpand">
      <el-icon class="music-icon" :class="{ 'is-playing': isPlaying }">
        <Headset />
      </el-icon>
      <span class="song-title" v-if="currentSong">{{ currentSong.name }}</span>
      <span class="song-title" v-else>暂无播放歌曲</span>
    </div>

    <!-- 展开状态 -->
    <div class="expanded-player" v-show="isExpanded">
      <div class="player-header">
        <span class="title">正在播放</span>
        <el-icon class="close-icon" @click="toggleExpand">
          <Close />
        </el-icon>
      </div>
      
      
      <div class="player-content">
        <div class="song-info">
          <template v-if="currentSong">
            <img :src="currentSong.pic ? HttpManager.attachImageUrl(currentSong.pic) : ''" class="cover" />
            <div class="info">
              <div class="name">{{ currentSong.name }}</div>
              <div class="singer">{{ currentSong.singerName }}</div>
            </div>
          </template>
          <template v-else>
            <div class="default-cover">
              <el-icon class="default-icon"><Headset /></el-icon>
            </div>
            <div class="info">
              <div class="name">暂无播放歌曲</div>
              <div class="singer">选择一首歌曲开始播放</div>
            </div>
          </template>
        </div>

        <div class="controls">
          <el-icon class="control-icon" @click="prev">
            <Back />
          </el-icon>
          <el-icon class="control-icon play-icon" @click="togglePlay">
            <component :is="isPlaying ? 'VideoPause' : 'VideoPlay'" />
          </el-icon>
          <el-icon class="control-icon" @click="next">
            <Right />
          </el-icon>
        </div>

        <div class="progress">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <el-slider
            v-model="currentTime"
            :max="duration"
            :show-tooltip="false"
            @change="handleProgressChange"
            :disabled="!currentSong"
          />
          <span class="time">{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '../store/player'
import { ElMessage } from 'element-plus'
import { Headset, VideoPlay, VideoPause, Back, Right, Close } from '@element-plus/icons-vue'
import { HttpManager } from '../api/HttpManager'

const playerStore = usePlayerStore()
const audio = ref(new Audio())
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isExpanded = ref(false)

const currentSong = computed(() => playerStore.currentSong)

// 监听播放状态变化
watch(() => playerStore.currentSong, (newSong) => {
  if (newSong) {
    // 确保URL是完整的
    const audioUrl = newSong.url.startsWith('http') ? newSong.url : HttpManager.attachImageUrl(newSong.url)
    audio.value.src = audioUrl
    audio.value.play().then(() => {
      isPlaying.value = true
      isExpanded.value = true
    }).catch(error => {
      console.error('播放失败:', error)
      ElMessage.error('音频加载失败，请检查音频文件是否存在')
      isPlaying.value = false
    })
  }
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function togglePlay() {
  if (!currentSong.value) return
  
  if (isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
  } else {
    // 确保URL是完整的
    const audioUrl = currentSong.value.url.startsWith('http') ? currentSong.value.url : HttpManager.attachImageUrl(currentSong.value.url)
    audio.value.src = audioUrl
    audio.value.play().then(() => {
      isPlaying.value = true
    }).catch(error => {
      console.error('播放失败:', error)
      ElMessage.error('音频加载失败，请检查音频文件是否存在')
      isPlaying.value = false
    })
  }
}

function prev() {
  const currentIndex = playerStore.playlist.findIndex(song => song.id === currentSong.value?.id)
  if (currentIndex > 0) {
    playerStore.setCurrentSong(playerStore.playlist[currentIndex - 1])
  }
}

function next() {
  const currentIndex = playerStore.playlist.findIndex(song => song.id === currentSong.value?.id)
  if (currentIndex < playerStore.playlist.length - 1) {
    playerStore.setCurrentSong(playerStore.playlist[currentIndex + 1])
  }
}

function handleProgressChange(value) {
  audio.value.currentTime = value
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 音频事件监听
function setupAudioListeners() {
  audio.value.addEventListener('timeupdate', () => {
    currentTime.value = audio.value.currentTime
  })

  audio.value.addEventListener('loadedmetadata', () => {
    duration.value = audio.value.duration
  })

  audio.value.addEventListener('ended', () => {
    next()
  })

  audio.value.addEventListener('error', () => {
    ElMessage.error('音频加载失败')
    isPlaying.value = false
  })

  audio.value.addEventListener('play', () => {
    isPlaying.value = true
  })

  audio.value.addEventListener('pause', () => {
    isPlaying.value = false
  })
}

onMounted(() => {
  setupAudioListeners()
})

onUnmounted(() => {
  audio.value.pause()
  audio.value.src = ''
})
</script>

<style scoped>
.audio-player {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.minimized-player {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.minimized-player:hover {
  transform: scale(1.05);
}

.music-icon {
  font-size: 24px;
  color: #409EFF;
  animation: none;
}

.music-icon.is-playing {
  animation: rotate 3s linear infinite;
}

.song-title {
  font-size: 14px;
  color: #303133;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expanded-player {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 300px;
  padding: 16px;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.close-icon {
  cursor: pointer;
  color: #909399;
}

.close-icon:hover {
  color: #409EFF;
}

.player-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.song-info {
  display: flex;
  gap: 12px;
}

.cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.singer {
  font-size: 12px;
  color: #909399;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.control-icon {
  font-size: 24px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-icon:hover {
  color: #409EFF;
  transform: scale(1.1);
}

.play-icon {
  font-size: 32px;
}

.progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time {
  font-size: 12px;
  color: #909399;
  min-width: 40px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.default-cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  background: linear-gradient(135deg, #409EFF, #36D1DC);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.default-icon {
  font-size: 32px;
  color: white;
}

.control-icon {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.control-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress :deep(.el-slider.is-disabled) {
  opacity: 0.5;
}
</style> 