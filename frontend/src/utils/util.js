// 获取歌曲名
 export function extractSongTitle(name) {
    const parts = name.split("-");
    return parts.length > 1 ? parts[1].trim() : name.trim();
  }
  
  // 获取歌手名
  export function extractSingerName(name) {
    const parts = name.split("-");
    return parts.length > 1 ? parts[0].trim() : "未知歌手";
  }