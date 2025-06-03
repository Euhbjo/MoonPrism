import { defineStore } from 'pinia'

const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    const user = JSON.parse(userStr)
    return user && typeof user === 'object' ? user : null
  } catch (e) {
    console.error('Error parsing stored user:', e)
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: getStoredUser()
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    getUser: (state) => state.user
  },
  actions: {
    setUser(user) {
      if (!user) {
        this.logout()
        return
      }
      this.user = user
      try {
        localStorage.setItem('user', JSON.stringify(user))
      } catch (e) {
        console.error('Error saving user to localStorage:', e)
      }
    },
    logout() {
      this.user = null
      try {
        localStorage.removeItem('user')
      } catch (e) {
        console.error('Error removing user from localStorage:', e)
      }
    },
    updateUserInfo(userInfo) {
      if (!this.user || !userInfo) return
      this.user = { ...this.user, ...userInfo }
      try {
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (e) {
        console.error('Error updating user in localStorage:', e)
      }
    }
  }
})
