<template>
  <div class="ranking-container">
    <el-card class="ranking-card">
      <template #header>
        <div class="card-header">
          <h2>歌单排行榜</h2>
          <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="all">总榜</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <el-table :data="rankingList" style="width: 100%">
        <el-table-column type="index" width="80" label="排名">
          <template #default="scope">
            <div class="rank-number" :class="{ 'top-three': scope.$index < 3 }">
              {{ scope.$index + 1 }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="歌单">
          <template #default="scope">
            <div class="song-info">
              <img :src="HttpManager.attachImageUrl(scope.row.pic)" class="song-cover" />
              <div class="song-details">
                <div class="song-name">{{ scope.row.title }}</div>
                <div class="singer-name">{{ scope.row.introduction }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="avgScore" label="平均评分" width="120">
          <template #default="scope">
            <div class="rating-display">
              <el-rate
                :model-value="Number(scope.row.avgScore)"
                disabled
                show-score
                text-color="#ff9900"
              />
              <span class="rating-text">{{ scope.row.avgScore }}分</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ratingCount" label="评分人数" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="goToDetail(scope.row.id)">查看详情</el-button>
            <el-button 
              size="small" 
              :type="isCollected(scope.row.id) ? 'danger' : 'primary'"
              @click="toggleCollect(scope.row)"
            >
              {{ isCollected(scope.row.id) ? '取消收藏' : '收藏' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HttpManager } from '../api/HttpManager'
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const rankingList = ref([])
const timeRange = ref('week')
const collectedLists = ref(new Set())

onMounted(async () => {
  await loadRankingList()
  await loadCollections()
})

async function loadRankingList() {
  try {
    const res = await HttpManager.getRankingList(timeRange.value)
    if (res && res.code === 200) {
      // 处理评分数据
      const scoreMap = new Map()
      res.data.forEach(item => {
        if (!scoreMap.has(item.songListId)) {
          scoreMap.set(item.songListId, {
            totalScore: 0,
            count: 0
          })
        }
        const stats = scoreMap.get(item.songListId)
        stats.totalScore += item.score
        stats.count++
      })

      // 获取歌单详情
      const listPromises = Array.from(scoreMap.keys()).map(async (listId) => {
        try {
          const listRes = await HttpManager.getSongList()
          const listData = Array.isArray(listRes) ? listRes : (listRes.data || [])
          const list = listData.find(item => item.id === listId)
          if (list) {
            const stats = scoreMap.get(listId)
            return {
              ...list,
              avgScore: (stats.totalScore / stats.count).toFixed(1),
              ratingCount: stats.count
            }
          }
          return null
        } catch (error) {
          console.error('获取歌单详情失败:', error)
          return null
        }
      })

      const lists = await Promise.all(listPromises)
      rankingList.value = lists
        .filter(item => item !== null)
        .sort((a, b) => b.avgScore - a.avgScore)
    }
  } catch (error) {
    console.error('加载排行榜失败:', error)
    ElMessage.error('加载排行榜失败')
  }
}

async function loadCollections() {
  if (!userStore.user) return
  
  try {
    const res = await HttpManager.getCollectionOfUser(userStore.user.id)
    if (res && res.code === 200) {
      const collections = Array.isArray(res.data) ? res.data : []
      // 清空之前的收藏状态
      collectedLists.value.clear()
      // 添加新的收藏状态
      collections
        .filter(item => item.type === 1)
        .forEach(item => collectedLists.value.add(item.songListId))
    }
  } catch (error) {
    console.error('加载收藏状态失败:', error)
  }
}

function isCollected(listId) {
  return collectedLists.value.has(listId)
}

async function toggleCollect(list) {
  if (!userStore.user) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isCollected(list.id)) {
      await HttpManager.deleteCollection(userStore.user.id, list.id)
      await loadCollections()
      ElMessage.success('已取消收藏')
    } else {
      await HttpManager.setCollection({
        userId: userStore.user.id,
        type: 1,
        songListId: list.id
      })
      await loadCollections()
      ElMessage.success('已收藏')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败')
  }
}

function goToDetail(id) {
  router.push(`/song-list/${id}`)
}

async function handleTimeRangeChange() {
  await loadRankingList()
  await loadCollections()
}
</script>

<style scoped>
.ranking-container {
  padding: 20px;
}

.ranking-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.song-details {
  display: flex;
  flex-direction: column;
}

.song-name {
  font-weight: 500;
  color: #303133;
}

.singer-name {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.rank-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f2f5;
  color: #606266;
  font-weight: bold;
}

.rank-number.top-three {
  background: #409EFF;
  color: white;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-text {
  color: #ff9900;
  font-weight: bold;
}
</style> 