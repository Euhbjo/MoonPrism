<template>
  <el-card class="singer-card" shadow="hover">
    <img :src="HttpManager.attachImageUrl(singer.pic)" class="singer-pic" />
    <div class="singer-name">{{ singer.name }}</div>
    <div class="singer-meta">
      <span>{{ getSex(singer.sex) }}</span>
      <span v-if="singer.birth">｜{{ formatBirth(singer.birth) }}</span>
      <span v-if="singer.location">｜{{ singer.location }}</span>
    </div>
    <div class="singer-intro">{{ singer.introduction ? singer.introduction.slice(0, 36) + (singer.introduction.length > 36 ? '...' : '') : '暂无简介' }}</div>
  </el-card>
</template>

<script setup>
import { HttpManager } from '../api/HttpManager'
const props = defineProps({ singer: Object })
function getSex(sex) {
  if (sex === 0) return '女';
  if (sex === 1) return '男';
  if (sex === 2) return '组合';
  if (sex === 3) return '其他';
  return '未知';
}
function formatBirth(birth) {
  if (!birth) return '';
  if (typeof birth === 'number') {
    const d = new Date(birth);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  if (typeof birth === 'string') {
    return birth.split(' ')[0];
  }
  return '';
}
</script>

<style scoped>
.singer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  min-height: 260px;
}
.singer-pic {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px #eee;
}
.singer-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 4px;
}
.singer-meta {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 6px;
}
.singer-intro {
  color: #666;
  font-size: 0.95rem;
  text-align: center;
  min-height: 32px;
}
</style> 