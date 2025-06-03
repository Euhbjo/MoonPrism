import { getBaseURL, get, post, deletes } from "./request";

const HttpManager = {
  attachImageUrl: (url) => url ? `${getBaseURL()}/${url}` : "https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png",
  signIn: ({username,password}) => post(`user/login/status`, {username,password}),
  signInByemail: ({email,password})=>post(`user/email/status`, {email,password}),
  SignUp: ({username,password,sex,phoneNum,email,birth,introduction,location}) => post(`user/add`, {username,password,sex,phoneNum,email,birth,introduction,location}),
  deleteUser: (id) => get(`user/delete?id=${id}`),
  updateUserMsg: ({id,username,sex,phoneNum,email,birth,introduction,location}) => post(`user/update`, {id,username,sex,phoneNum,email,birth,introduction,location}),
  updateUserPassword: ({id,username,oldPassword,password}) => post(`user/updatePassword`, {id,username,oldPassword,password}),
  getUserOfId: (id) => get(`user/detail?id=${id}`),
  uploadUrl: (userId) => `${getBaseURL()}/user/avatar/update?id=${userId}`,
  getSongList: () => get("songList"),
  getSongListOfStyle: (style) => get(`songList/style/detail?style=${style}`),
  getSongListOfLikeTitle: (keywords) => get(`songList/likeTitle/detail?title=${keywords}`),
  getSongListOfSongId: (songListId) => get(`listSong/detail?songListId=${songListId}`),
  getAllSinger: () => get("singer"),
  getSingerOfSex: (sex) => get(`singer/sex/detail?sex=${sex}`),
  getCollectionOfUser: (userId) => get(`collection/detail?userId=${userId}`),
  setCollection: ({userId,type,songId,songListId}) => post(`collection/add`,{userId,type,songId,songListId}),
  deleteCollection: (userId, songId) => deletes(`collection/delete?userId=${userId}&&songId=${songId}`),
  isCollection: ({userId, type, songId}) => post(`collection/status`, {userId, type, songId}),
  setRank: ({songListId,consumerId,score}) => post(`rankList/add`, {songListId,consumerId,score}),
  getRankOfSongListId: (songListId) => get(`rankList?songListId=${songListId}`),
  getRankingList:()=>get("rankList/all"),
  getUserRank: (consumerId, songListId) => get(`/rankList/user?consumerId=${consumerId}&songListId=${songListId}`),
  setComment: ({userId,content,songId,songListId,nowType}) => post(`comment/add`, {userId,content,songId,songListId,nowType}),
  deleteComment: (id) => get(`comment/delete?id=${id}`),
  setSupport: ({id,up}) => post(`comment/like`, {id,up}),
  getAllComment: (type, id) => {
    let url = "";
    if (type === 1) {
      url = `comment/songList/detail?songListId=${id}`;
    } else if (type === 0) {
      url = `comment/song/detail?songId=${id}`;
    }
    return get(url);
  },
  getSongOfId: (id) => get(`song/detail?id=${id}`),
  getSongOfSingerId: (id) => get(`song/singer/detail?singerId=${id}`),
  getSongOfSingerName: (keywords) => get(`song/singerName/detail?name=${keywords}`),
  downloadMusic: (url) => get(url, { responseType: "blob" }),
  testAlreadySupport:({commentId,userId}) => post(`userSupport/test`, {commentId,userId}),
  deleteUserSupport:({commentId,userId}) => post(`userSupport/delete`, {commentId,userId}),
  insertUserSupport:({commentId,userId}) => post(`userSupport/insert`, {commentId,userId}),
  getBannerList: () => get("banner/getAllBanner")
};

export { HttpManager }; 