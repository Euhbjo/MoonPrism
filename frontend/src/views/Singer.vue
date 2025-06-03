<template>
  <div>
    <h2 style="margin-bottom: 20px;">全部歌手</h2>
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in singers" :key="item.id">
        <SingerCard :singer="item" @click="goDetail(item.id)" style="cursor:pointer;" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HttpManager } from '../api/HttpManager'
import SingerCard from '../components/SingerCard.vue'
import { useRouter } from 'vue-router'

const singers = ref([])
const router = useRouter()

onMounted(async () => {
  const res = await HttpManager.getAllSinger()
  singers.value = Array.isArray(res) ? res : (res.data || [])
})
function goDetail(id) {
  router.push(`/singer/${id}`)
}
</script> 