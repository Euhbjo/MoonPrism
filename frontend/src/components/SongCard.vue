<template>
  <div @click="goToDetail" style="cursor: pointer;">
    <el-card>
      <img :src="HttpManager.attachImageUrl(songList.pic)" style="width:100%;height:120px;object-fit:cover;">
      <div style="margin:10px 0 5px 0;font-weight:bold;">{{ songList.title }}</div>
      <!-- <div style="font-size:12px;color:#888;">{{ songList.introduction || '暂无简介' }}</div> -->
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HttpManager } from '../api/HttpManager'

const props = defineProps({ songList: Object })
const router = useRouter()

function goToDetail() {
  router.push(`/song-list/${props.songList.id}`)
}
</script>
