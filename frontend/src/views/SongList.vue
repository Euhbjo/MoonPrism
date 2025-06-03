<template>
  <el-row :gutter="20">
    <el-col :span="6" v-for="item in songLists" :key="item.id">
      <SongCard :songList="item" />
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HttpManager } from '../api/HttpManager'
import SongCard from '../components/SongCard.vue'

const songLists = ref([])

onMounted(async () => {
  const res = await HttpManager.getSongList()
  songLists.value = Array.isArray(res) ? res : (res.data || [])
})
</script> 