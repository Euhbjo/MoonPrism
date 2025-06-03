<template>
  <div class="home-banner">
    <Banner />
    <div class="banner-title">发现好音乐，享受美好生活</div>
  </div>
  <el-row style="margin-bottom: 20px;">
    <el-col :span="8">
      <el-input v-model="searchKeyword" placeholder="搜索歌单/歌手/歌曲" clearable @keyup.enter="onSearch">
        <template #append>
          <el-button @click="onSearch">搜索</el-button>
        </template>
      </el-input>
    </el-col>
    <el-col :span="16">
      <el-radio-group v-model="searchType" style="margin-left: 20px;">
        <el-radio-button label="list">歌单</el-radio-button>
        <el-radio-button label="singer">歌手</el-radio-button>
        <el-radio-button label="song">歌曲</el-radio-button>
      </el-radio-group>
      <el-select v-model="filterStyle" placeholder="全部类型" style="margin-left: 20px; width: 160px;" @change="onFilterStyle">
        <el-option label="全部类型" value="" />
        <el-option v-for="style in styles" :key="style" :label="style" :value="style" />
      </el-select>
    </el-col>
  </el-row>
  <el-divider>推荐歌单</el-divider>
  <el-row :gutter="20">
    <el-col :span="6" v-for="item in songLists" :key="item.id">
      <SongCard :songList="item" class="song-card-hover" />
    </el-col>
  </el-row>
  <el-dialog v-model="showSongDialog" title="搜索歌曲结果" width="600px">
    <el-table :data="searchSongs">
      <el-table-column prop="name" label="歌曲名" />
      <el-table-column prop="singerName" label="歌手" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="play(scope.row)">播放</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HttpManager } from '../api/HttpManager'
import SongCard from '../components/SongCard.vue'
import Banner from '../components/Banner.vue'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '../store/player'

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
  //hhhhhhhh,终于完成播放功能
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
.home-banner {
  position: relative;
  margin-bottom: 30px;
}
.banner-title {
  position: absolute;
  left: 40px;
  top: 40px;
  color: #fff;
  font-size: 2.2rem;
  font-weight: bold;
  text-shadow: 0 2px 8px #333;
  z-index: 2;
}
.song-card-hover {
  transition: box-shadow 0.2s, transform 0.2s;
}
.song-card-hover:hover {
  box-shadow: 0 8px 32px #aaa;
  transform: translateY(-8px) scale(1.03);
  z-index: 2;
}
</style> 