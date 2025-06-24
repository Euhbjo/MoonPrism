<template>
  <div class="song-card" @click="goToDetail">
    <div class="card-inner">
      <div class="card-image">
        <img :src="HttpManager.attachImageUrl(songList.pic)" :alt="songList.title">
        <div class="card-overlay">
          <el-icon class="play-icon"><VideoPlay /></el-icon>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">{{ songList.title }}</h3>
        <p class="card-desc">{{ songList.introduction || '暂无简介' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HttpManager } from '../api/HttpManager'
import { VideoPlay } from '@element-plus/icons-vue'

const props = defineProps({ songList: Object })
const router = useRouter()

function goToDetail() {
  router.push(`/song-list/${props.songList.id}`)
}
</script>

<style scoped>
.song-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.song-card:hover {
  transform: translateY(-5px);
}

.card-inner {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.song-card:hover .card-inner {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 宽高比 */
  overflow: hidden;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.song-card:hover .card-image img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.song-card:hover .card-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 48px;
  color: #fff;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.song-card:hover .play-icon {
  transform: scale(1);
}

.card-content {
  padding: 12px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.card-desc {
  margin: 8px 0 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}
</style>
