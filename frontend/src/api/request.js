import axios from 'axios'

export function getBaseURL() {
  // 这里请根据你的后端实际地址修改
  return 'http://localhost:8888'
}

const service = axios.create({
  baseURL: getBaseURL(),
  timeout: 5000
})

export function get(url, config = {}) {
  return service.get(url, config).then(res => res.data)
}

export function post(url, data, config = {}) {
  return service.post(url, data, config).then(res => res.data)
}

export function deletes(url, config = {}) {
  return service.delete(url, config).then(res => res.data)
} 