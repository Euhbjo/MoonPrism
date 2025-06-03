<template>
  <el-card v-if="user">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="个人资料" name="profile">
        <div class="profile-container">
          <div class="avatar-section">
            <el-avatar :size="100" :src="getBaseURL() + user.avatar || defaultAvatar" />
            <el-upload
              class="avatar-uploader"
              :action="HttpManager.uploadUrl(user.id)"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-button type="primary" size="small">更换头像</el-button>
            </el-upload>
          </div>
          <el-form :model="editForm" label-width="80px" class="profile-form">
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled />
            </el-form-item>
            <el-form-item label="性别">
              <el-select v-model="editForm.sex">
                <el-option label="男" :value="1" />
                <el-option label="女" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="editForm.phoneNum" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="editForm.email" />
            </el-form-item>
            <el-form-item label="生日">
              <el-date-picker v-model="editForm.birth" type="date" />
            </el-form-item>
            <el-form-item label="简介">
              <el-input v-model="editForm.introduction" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="地区">
              <el-input v-model="editForm.location" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateUser">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="修改密码" name="password">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px" class="password-form">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="password">
            <el-input v-model="passwordForm.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updatePassword">修改密码</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="我的收藏" name="collection">
        <el-tabs v-model="collectionTab">
          <el-tab-pane label="收藏歌曲" name="songs">
            <el-table :data="collectedSongs" style="width: 100%">
              <el-table-column label="歌曲名">
                <template #default="scope">
                  {{ scope.row[0].name }}
                </template>
              </el-table-column>
              <el-table-column label="歌手">
                <template #default="scope">
                  {{ scope.row[0].name.split('-')[0] }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button size="small" @click="play(scope.row[0])">播放</el-button>
                  <el-button size="small" type="danger" @click="removeSong(scope.row)">取消收藏</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="收藏歌单" name="lists">
            <el-table :data="collectedLists" style="width: 100%">
              <el-table-column prop="title" label="歌单名" />
              <el-table-column prop="introduction" label="简介" show-overflow-tooltip />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button size="small" @click="goToList(scope.row.id)">查看</el-button>
                  <el-button size="small" type="danger" @click="removeList(scope.row)">取消收藏</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <el-tab-pane label="我的评论" name="comments">
        <el-table :data="myComments" style="width: 100%">
          <el-table-column prop="content" label="评论内容" />
          <el-table-column prop="createTime" label="评论时间" width="180" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button size="small" type="danger" @click="deleteComment(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
  <el-card v-else>
    <el-alert title="请先登录" type="warning" />
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../store/user'
import { HttpManager } from '../api/HttpManager'
import{getBaseURL} from '../api/request'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlayerStore } from '../store/player'

const userStore = useUserStore()
const router = useRouter()
const user = computed(() => userStore.user)
const defaultAvatar = 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'

const activeTab = ref('profile')
const collectionTab = ref('songs')
const collectedSongs = ref([])
const collectedLists = ref([])
const myComments = ref([])
const editForm = ref({})
const passwordForm = ref({ oldPassword: '', password: '', confirmPassword: '' })
const passwordFormRef = ref(null)

const playerStore = usePlayerStore()

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'))
  } else {
    if (passwordForm.value.confirmPassword !== '') {
      passwordFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

onMounted(async () => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    console.log('User not logged in, redirecting to login page')
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  // 确保用户数据存在
  if (!user.value || !user.value.id) {
    console.log('User data missing, attempting to restore from localStorage')
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('Parsed user:', parsedUser)
        if (parsedUser && parsedUser.id) {
          userStore.setUser(parsedUser)
        } else {
          throw new Error('Invalid user data in localStorage')
        }
      } catch (e) {
        console.error('Error restoring user data:', e)
        ElMessage.error('用户数据已损坏，请重新登录')
        userStore.logout()
        router.push('/login')
        return
      }
    } else {
      ElMessage.error('用户数据丢失，请重新登录')
      userStore.logout()
      router.push('/login')
      return
    }
  }
  
  console.log('Current user:', user.value)
  
  // 初始化编辑表单
  editForm.value = {
    id: user.value.id,
    username: user.value.username,
    sex: user.value.sex,
    phoneNum: user.value.phoneNum,
    email: user.value.email,
    birth: user.value.birth,
    introduction: user.value.introduction,
    location: user.value.location
  }
  
  try {
    // 获取收藏
    const res = await HttpManager.getCollectionOfUser(user.value.id)
    console.log('Collections:', res)
    if (res && res.code === 200) {
      const arr = Array.isArray(res.data) ? res.data : []
      // 获取收藏的歌曲详情
      const songPromises = arr
        .filter(i => i.type === 0)
        .map(async (item) => {
          try {
            const songRes = await HttpManager.getSongOfId(item.songId)
            if (songRes && songRes.code === 200 && songRes.data) {
              return {
                ...songRes.data,
                collectionId: item.id  // 保存收藏记录的id用于删除操作
              }
            }
            return null
          } catch (error) {
            console.error('获取歌曲详情失败:', error)
            return null
          }
        })
      
      const songs = await Promise.all(songPromises)
      collectedSongs.value = songs.filter(song => song !== null)
      console.log('Collected songs:', collectedSongs.value)
      // 获取收藏的歌单详情
      const listPromises = arr
        .filter(i => i.type === 1)
        .map(async (item) => {
          try {
            console.log('Processing collection item:', item)
            const listRes = await HttpManager.getSongList()
            console.log('Song list response:', listRes)
            if (listRes && res.code === 200) {
              const listData = Array.isArray(listRes) ? listRes : (listRes.data || [])
              console.log('Available song lists:', listData)
              // 使用 songListId 作为歌单 id
              const list = listData.find(l => l.id === item.songListId)
              if (list) {
                console.log('Found matching list:', list)
                return {
                  ...list,
                  collectionId: item.id  // 保存收藏记录的id用于删除操作
                }
              }
            }
            return null
          } catch (error) {
            console.error('获取歌单详情失败:', error)
            return null
          }
        })
      
      const lists = await Promise.all(listPromises)
      collectedLists.value = lists.filter(list => list !== null)
      console.log('Collected lists:', collectedLists.value)
    }
    
    // 获取评论
    const commentRes = await HttpManager.getAllComment(1, 1)
    console.log('Comments:', commentRes)
    if (commentRes && commentRes.code === 200) {
      myComments.value = Array.isArray(commentRes.data) ? commentRes.data : []
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    ElMessage.error('加载用户数据失败')
  }
})

function play(song) {
  if (song.url) {
    const songWithFullUrl = {
      ...song,
      url: HttpManager.attachImageUrl(song.url)
    }
    playerStore.setCurrentSong(songWithFullUrl)
    playerStore.setPlaylist(collectedSongs.value.map(s => ({
      ...s,
      url: HttpManager.attachImageUrl(s.url)
    })))
  } else {
    ElMessage.info('该歌曲暂无音频资源')
  }
}

function removeSong(row) {
  HttpManager.deleteCollection(user.value.id, row.collectionId).then(() => {
    ElMessage.success('已取消收藏')
    collectedSongs.value = collectedSongs.value.filter(i => i.collectionId !== row.collectionId)
  }).catch(error => {
    console.error('取消收藏失败:', error)
    ElMessage.error('取消收藏失败')
  })
}

function removeList(row) {
  HttpManager.deleteCollection(user.value.id, row.collectionId).then(() => {
    ElMessage.success('已取消收藏')
    collectedLists.value = collectedLists.value.filter(i => i.collectionId !== row.collectionId)
  }).catch(error => {
    console.error('取消收藏失败:', error)
    ElMessage.error('取消收藏失败')
  })
}

function goToList(id) {
  router.push(`/song-list/${id}`)
}

function deleteComment(row) {
  HttpManager.deleteComment(row.id).then(() => {
    ElMessage.success('已删除')
    myComments.value = myComments.value.filter(i => i.id !== row.id)
  })
}

function updateUser() {
  HttpManager.updateUserMsg(editForm.value).then(res => {
    console.log('Update user response:', res)
    if (res.code === 200) {
      ElMessage.success('修改成功')
      userStore.updateUserInfo(editForm.value)
    } else {
      ElMessage.error(res.msg || '修改失败')
    }
  })
}

async function updatePassword() {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    
    if (!passwordForm.value.oldPassword || !passwordForm.value.password) {
      ElMessage.warning('请填写完整信息')
      return
    }
    
    const res = await HttpManager.updateUserPassword({
      id: user.value.id,
      username: user.value.username,
      oldPassword: passwordForm.value.oldPassword,
      password: passwordForm.value.password
    })
    
    if (res.code === 200) {
      ElMessage.success('修改成功，请重新登录')
      // 清除用户信息并跳转到登录页
      userStore.logout()
      router.push('/login')
    } else {
      ElMessage.error(res.msg || '修改失败')
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    ElMessage.error('密码修改失败')
  }
}

function handleAvatarSuccess(res) {
  if (res.code === 200) {
    ElMessage.success('头像更新成功')
    userStore.updateUserInfo({ avatar: res.data })
  } else {
    ElMessage.error(res.msg || '头像更新失败')
  }
}

function beforeAvatarUpload(file) {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}
</script>

<style scoped>
.profile-container {
  display: flex;
  gap: 40px;
  padding: 20px;
}
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.profile-form {
  flex: 1;
  max-width: 500px;
}
.password-form {
  max-width: 500px;
  margin: 0 auto;
}
.avatar-uploader {
  text-align: center;
}
</style> 