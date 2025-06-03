import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref(null)
  const playlist = ref([])
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)

  const hasNext = computed(() => {
    if (!currentSong.value || !playlist.value.length) return false
    const currentIndex = playlist.value.findIndex(song => song.id === currentSong.value.id)
    return currentIndex < playlist.value.length - 1
  })

  const hasPrev = computed(() => {
    if (!currentSong.value || !playlist.value.length) return false
    const currentIndex = playlist.value.findIndex(song => song.id === currentSong.value.id)
    return currentIndex > 0
  })

  function setCurrentSong(song) {
    currentSong.value = song
    isPlaying.value = true
  }

  function setPlaylist(songs) {
    playlist.value = songs
  }

  function setPlaying(playing) {
    isPlaying.value = playing
  }

  function setCurrentTime(time) {
    currentTime.value = time
  }

  function setDuration(time) {
    duration.value = time
  }

  function addToPlaylist(song) {
    if (!playlist.value.find(s => s.id === song.id)) {
      playlist.value.push(song)
    }
  }

  function removeFromPlaylist(songId) {
    const index = playlist.value.findIndex(s => s.id === songId)
    if (index > -1) {
      playlist.value.splice(index, 1)
    }
  }

  function clearPlaylist() {
    playlist.value = []
    currentSong.value = null
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
  }

  return {
    currentSong,
    playlist,
    isPlaying,
    currentTime,
    duration,
    hasNext,
    hasPrev,
    setCurrentSong,
    setPlaylist,
    setPlaying,
    setCurrentTime,
    setDuration,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist
  }
}) 