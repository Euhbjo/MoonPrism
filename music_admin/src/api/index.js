import axios from 'axios'

const baseURL = 'http://localhost:8888'

const getBaseURL = () => baseURL

const get = (url) => axios.get(`${baseURL}/${url}`)
const post = (url, data) => axios.post(`${baseURL}/${url}`, data)
const deletes = (url) => axios.delete(`${baseURL}/${url}`)

// 添加文件上传方法
const uploadFile = (url, formData) => {
  return axios.post(`${baseURL}/${url}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

const HttpManager = {
    // 获取图片信息
    attachImageUrl: (url) => `${getBaseURL()}/${url}`,
    
    // 管理员 API
    getLoginStatus: ({username, password}) => post(`admin/login/status`, {username, password}),

    // 用户 API
    getAllUser: () => get(`user`),
    getUserOfId: (id) => get(`user/detail?id=${id}`),
    deleteUser: (id) => get(`user/delete?id=${id}`),

    // 歌手 API
    getAllSinger: () => get(`singer`),

    // 歌单 API
    getAllPlaylist: () => get(`songList`),
    addPlaylist: ({title, introduction, style}) => post(`songList/add`, {title, introduction, style}),
    updatePlaylistMsg: ({id, title, introduction, style}) => post(`songList/update`, {id, title, introduction, style}),
    deletePlaylist: (id) => get(`songList/delete?id=${id}`),
    updatePlaylistImg: (id) => `${getBaseURL()}/songList/img/update?id=${id}`,

    // 歌单歌曲 API
    getPlaylistSongs: (songListId) => get(`listSong/detail?songListId=${songListId}`),
    addPlaylistSong: ({songId, songListId}) => post(`listSong/add`, {songId, songListId}),
    deletePlaylistSong: (songId) => get(`listSong/delete?songId=${songId}`),

    // 歌曲 API
    getAllSong: () => get(`song`),
    getSongOfSingerId: (id) => get(`song/singer/detail?singerId=${id}`),
    getSongOfId: (id) => get(`song/detail?id=${id}`),
    getSongOfSingerName: (id) => get(`song/singerName/detail?name=${id}`),
    updateSongMsg: ({id, singerId, name, introduction, lyric}) => post(`song/update`, {
        id,
        singerId,
        name,
        introduction,
        lyric
    }),
    // 修改上传相关的方法
    updateSongUrl: (id) => `song/url/update?id=${id}`,
    updateSongImg: (id) => `song/img/update?id=${id}`,
    updateSongLrc: (id) => `song/lrc/update?id=${id}`,
    deleteSong: (id) => deletes(`song/delete?id=${id}`),
    
    // 添加新的上传方法
    uploadSongFile: (id, file) => {
      const formData = new FormData()
      formData.append('file', file)
      return uploadFile(`song/url/update?id=${id}`, formData)
    },

    // 添加图片上传方法
    uploadSongImage: (id, file) => {
      const formData = new FormData()
      formData.append('file', file)
      return uploadFile(`song/img/update?id=${id}`, formData)
    }
}

export { HttpManager } 