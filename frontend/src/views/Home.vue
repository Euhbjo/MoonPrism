<template>
  <div class="home-container">
    <div class="home-banner">
      <Banner />
      <div class="banner-title">发现好音乐，享受美好生活</div>
    </div>

    <div class="search-section">
      <el-row :gutter="20" align="middle">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索歌单/歌手/歌曲"
            clearable
            @keyup.enter="onSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="onSearch">搜索</el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="16">
          <div class="filter-section">
            <el-radio-group v-model="searchType" class="search-type">
              <el-radio-button label="list">歌单</el-radio-button>
              <el-radio-button label="singer">歌曲</el-radio-button>
            </el-radio-group>
            <el-select
              v-model="filterStyle"
              placeholder="全部类型"
              class="style-select"
              @change="onFilterStyle"
            >
              <el-option label="全部类型" value="" />
              <el-option v-for="style in styles" :key="style" :label="style" :value="style" />
            </el-select>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="section-title">
      <el-divider>
        <span class="title-text">推荐歌单</span>
      </el-divider>
    </div>

    <el-row :gutter="20" class="song-list-grid">
      <el-col :xs="12" :sm="8" :md="6" :lg="6" v-for="item in songLists" :key="item.id">
        <SongCard :songList="item" />
      </el-col>
    </el-row>

    <el-dialog
      v-model="showSongDialog"
      title="搜索歌曲结果"
      width="600px"
      class="search-dialog"
    >
      <el-table :data="searchSongs" style="width: 100%">
        <el-table-column prop="name" label="歌曲名" />
        <el-table-column prop="singerName" label="歌手" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" type="primary" @click="play(scope.row)">
              播放
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HttpManager } from '../api/HttpManager'
import SongCard from '../components/SongCard.vue'
import Banner from '../components/Banner.vue'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '../store/player'
import { Search } from '@element-plus/icons-vue'

const songLists = ref([])
const searchKeyword = ref('')
const searchType = ref('list')
const showSongDialog = ref(false)
const searchSongs = ref([])
const filterStyle = ref('')
const styles = ref([
  '华语', '欧美', '轻音乐', 'BGM', '粤语', '日韩', '乐器', '组合', '女声', '男声'
])

const playerStore = usePlayerStore()

onMounted(async () => {
  const res = await HttpManager.getSongList()
  songLists.value = Array.isArray(res) ? res : (res.data || [])
})

async function onSearch() {
  if (!searchKeyword.value) {
    ElMessage.warning('请输入关键词')
    return
  }
  if (searchType.value === 'list') {
    const res = await HttpManager.getSongListOfLikeTitle(searchKeyword.value)
    songLists.value = Array.isArray(res) ? res : (res.data || [])
  } else if (searchType.value === 'singer') {
    const res = await HttpManager.getSongOfSingerName(searchKeyword.value)
    searchSongs.value = Array.isArray(res) ? res : (res.data || [])
    showSongDialog.value = true
  } else if (searchType.value === 'song') {
    const res = await HttpManager.getSongOfId(searchKeyword.value)
    searchSongs.value = Array.isArray(res) ? res : (res.data || [])
    showSongDialog.value = true
  }
}

async function onFilterStyle(style) {
  if (!style) {
    const res = await HttpManager.getSongList()
    songLists.value = Array.isArray(res) ? res : (res.data || [])
    return
  }
  const res = await HttpManager.getSongListOfStyle(style)
  songLists.value = Array.isArray(res) ? res : (res.data || [])
}

function play(song) {
  if (song.url) {
    const songWithFullUrl = {
      ...song,
      url: HttpManager.attachImageUrl(song.url)
    }
    playerStore.setCurrentSong(songWithFullUrl)
    playerStore.setPlaylist(searchSongs.value.map(s => ({
      ...s,
      url: HttpManager.attachImageUrl(s.url)
    })))
  } else {
    ElMessage.info('该歌曲暂无音频资源')
  }
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.home-banner {
  position: relative;
  margin-bottom: 40px;
  border-radius: 16px;
  overflow: hidden;
}

.banner-title {
  position: absolute;
  left: 40px;
  top: 40px;
  color: #fff;
  font-size: 2.2rem;
  font-weight: bold;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.search-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-input {
  width: 100%;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-type {
  margin-right: 20px;
}

.style-select {
  width: 160px;
}

.section-title {
  margin: 40px 0;
}

.title-text {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.song-list-grid {
  margin-top: 20px;
}

.search-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

@media (max-width: 768px) {
  .home-container {
    padding: 10px;
  }

  .banner-title {
    font-size: 1.5rem;
    left: 20px;
    top: 20px;
  }

  .search-section {
    padding: 15px;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .search-type {
    margin-right: 0;
  }

  .style-select {
    width: 100%;
  }
}
</style> 