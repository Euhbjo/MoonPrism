<template>
  <el-card>
    <h2>{{ singer.name }}</h2>
    <img :src="HttpManager.attachImageUrl(singer.pic)" class="singer-detail-pic" />
    <div>性别：{{ getSex(singer.sex) }}</div>
    <div>出生：{{ getBirth(singer.birth) ? getBirth(singer.birth): '未知' }}</div>
    <div>地区：{{ singer.location || '未知' }}</div>
    <div>简介：{{ singer.introduction || '暂无简介' }}</div>
    <el-divider>歌曲列表</el-divider>
    <el-table :data="songs" style="width:100%">
      <el-table-column label="歌曲名">
        <template #default="scope">
          <div class="song-name-cell">
            <span>{{ extractSongTitle(scope.row.name) }}</span>
            <el-icon v-if="isCurrentSong(scope.row)" class="playing-icon">
              <VideoPlay />
            </el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-tooltip content="播放" placement="top">
            <el-button 
              circle
              size="small" 
              @click="play(scope.row)"
              :type="isCurrentSong(scope.row) && playerStore.isPlaying ? 'primary' : 'default'"
            >
              <el-icon><VideoPlay /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="详情" placement="top">
            <el-button circle size="small" @click="goSongDetail(scope.row.id)">
              <el-icon><InfoFilled /></el-icon>
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HttpManager } from '../api/HttpManager'
import { ElMessage } from 'element-plus'
import { extractSongTitle } from '../utils/util'
import { VideoPlay, InfoFilled } from '@element-plus/icons-vue'
import { usePlayerStore } from '../store/player'

const route = useRoute()
const router = useRouter()
const singer = ref({})
const songs = ref([])
const playerStore = usePlayerStore()

onMounted(async () => {
  const id = route.params.id
  const res = await HttpManager.getAllSinger()
  const arr = Array.isArray(res) ? res : (res.data || [])
  singer.value = arr.find(item => item.id == id) || {}
  const res2 = await HttpManager.getSongOfSingerId(id)
  songs.value = Array.isArray(res2) ? res2 : (res2.data || [])
})

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

function isCurrentSong(song) {
  return playerStore.currentSong && playerStore.currentSong.id === song.id
}

function goSongDetail(id) {
  router.push(`/song/${id}`)
}

function getSex(sex) {
  if (sex === 0) return '女';
  if (sex === 1) return '男';
  if (sex === 2) return '组合';
  if (sex === 3) return '其他';
  return '未知';
}

function getBirth(value) {
  if (value == null || value == "") return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
  const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  return year + "-" + month + "-" + day;
}
</script>

<style scoped>
.singer-detail-pic {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px #eee;
}

.song-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.playing-icon {
  color: #409EFF;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 

