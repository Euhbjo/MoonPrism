<template>
  <div class="banner-container">
    <el-carousel v-if="banners.length > 0" height="400px" :interval="4000" type="card">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img :src="HttpManager.attachImageUrl(item.pic)" class="banner-image" :alt="item.title">
        <div class="banner-content">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </el-carousel-item>
    </el-carousel>
    <div v-else-if="loading" class="banner-loading">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else class="banner-error">
      <el-empty description="暂无轮播图" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HttpManager } from '../api/HttpManager'
import { ElMessage } from 'element-plus'

const banners = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await HttpManager.getBannerList()
    console.log('Banner response:', res)
    if (res && res.code === 200) {
      banners.value = Array.isArray(res.data) ? res.data : []
    } else {
      ElMessage.warning('获取轮播图失败')
    }
  } catch (error) {
    console.error('Error loading banners:', error)
    ElMessage.error('加载轮播图失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.banner-container {
  width: 100%;
  margin-bottom: 30px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.banner-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  border-radius: 0 0 8px 8px;
}

.banner-content h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.banner-content p {
  margin: 10px 0 0;
  font-size: 16px;
  opacity: 0.9;
}

.banner-loading,
.banner-error {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
}
</style> 