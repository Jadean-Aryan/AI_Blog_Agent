// import axios from 'axios'

// const api = axios.create({
//   baseURL: '/api',
//   headers: { 'Content-Type': 'application/json' },
//   withCredentials: true,
// })

// // ─── Global 401 interceptor ──────────────────────────────────────────────────
// // If any request returns 401 (session expired), clear storage and redirect
// // to /login automatically — no manual handling needed per page.
// api.interceptors.response.use(
//   res => res,
//   err => {
//     if (err?.response?.status === 401) {
//       localStorage.removeItem('session')
//       localStorage.removeItem('guestMode')
//       if (!window.location.pathname.includes('/login')) {
//         window.location.href = '/login'
//       }
//     }
//     return Promise.reject(err)
//   }
// )

// // ─── Auth ─────────────────────────────────────────────────────────────────────
// export const register = (data) => api.post('/auth/register', data)
// export const login    = (data) => api.post('/auth/login', data)
// export const logout   = ()     => api.post('/auth/logout')
// export const getMe    = ()     => api.get('/auth/me')

// // ─── Admin: user management ───────────────────────────────────────────────────
// export const listUsers   = ()                => api.get('/auth/users')
// export const setUserRole = (userId, role)    => api.patch(`/auth/users/${userId}/role`, { role })

// // ─── Posts ────────────────────────────────────────────────────────────────────
// export const createPost        = (data)             => api.post('/posts/', data)
// export const listPosts         = (skip=0, limit=50) => api.get('/posts/', { params: { skip, limit } })
// export const getPost           = (id)               => api.get(`/posts/${id}`)
// export const updatePost        = (id, data)         => api.patch(`/posts/${id}`, data)
// export const deletePost        = (id)               => api.delete(`/posts/${id}`)
// export const regenerateOutline = (id)               => api.post(`/posts/${id}/regenerate-outline`)

// // ─── Sections ─────────────────────────────────────────────────────────────────
// export const generateSection     = (data)      => api.post('/sections/generate', data)
// export const generateAllSections = (outlineId) => api.post(`/sections/generate-all/${outlineId}`)
// export const updateSection       = (id, data)  => api.patch(`/sections/${id}`, data)
// export const reorderSections     = (data)      => api.post('/sections/reorder', data)

// // ─── SEO ──────────────────────────────────────────────────────────────────────
// export const runSEOAnalysis = (postId) => api.post(`/seo/analyze/${postId}`)
// export const getSEOAnalyses = (postId) => api.get(`/seo/analysis/${postId}`)
// export const generateMeta   = (postId) => api.post(`/seo/meta/${postId}`)
// export const getMetaTags    = (postId) => api.get(`/seo/meta/${postId}`)

// // ─── Export ───────────────────────────────────────────────────────────────────
// export const exportMarkdown = (postId) => api.get(`/export/${postId}/markdown`, { responseType: 'blob' })
// export const exportHTML     = (postId) => api.get(`/export/${postId}/html`,     { responseType: 'blob' })

// export default api


// import axios from 'axios'

// const api = axios.create({
//   baseURL: '/api',
//   headers: { 'Content-Type': 'application/json' },
//   withCredentials: true,
// })

// // ─── Global 401 interceptor ──────────────────────────────────────────────────
// // Only redirect to /login on 401 for protected routes, NOT for /auth/me
// // (getMe failing just means user isn't logged in — that's fine on the homepage)
// api.interceptors.response.use(
//   res => res,
//   err => {
//     const isAuthMe = err?.config?.url?.includes('/auth/me')
//     if (err?.response?.status === 401 && !isAuthMe) {
//       localStorage.removeItem('session')
//       localStorage.removeItem('guestMode')
//       if (!window.location.pathname.includes('/login')) {
//         window.location.href = '/login'
//       }
//     }
//     return Promise.reject(err)
//   }
// )

// // ─── Auth ─────────────────────────────────────────────────────────────────────
// export const register = (data) => api.post('/auth/register', data)
// export const login    = (data) => api.post('/auth/login', data)
// export const logout   = ()     => api.post('/auth/logout')
// export const getMe    = ()     => api.get('/auth/me')

// // ─── Admin: user management ───────────────────────────────────────────────────
// export const listUsers   = ()                => api.get('/auth/users')
// export const setUserRole = (userId, role)    => api.patch(`/auth/users/${userId}/role`, { role })

// // ─── Posts ────────────────────────────────────────────────────────────────────
// export const createPost        = (data)             => api.post('/posts/', data)
// export const listPosts         = (skip=0, limit=50) => api.get('/posts/', { params: { skip, limit } })
// export const getPost           = (id)               => api.get(`/posts/${id}`)
// export const updatePost        = (id, data)         => api.patch(`/posts/${id}`, data)
// export const deletePost        = (id)               => api.delete(`/posts/${id}`)
// export const regenerateOutline = (id)               => api.post(`/posts/${id}/regenerate-outline`)

// // ─── Sections ─────────────────────────────────────────────────────────────────
// export const generateSection     = (data)      => api.post('/sections/generate', data)
// export const generateAllSections = (outlineId) => api.post(`/sections/generate-all/${outlineId}`)
// export const updateSection       = (id, data)  => api.patch(`/sections/${id}`, data)
// export const reorderSections     = (data)      => api.post('/sections/reorder', data)

// // ─── SEO ──────────────────────────────────────────────────────────────────────
// export const runSEOAnalysis = (postId) => api.post(`/seo/analyze/${postId}`)
// export const getSEOAnalyses = (postId) => api.get(`/seo/analysis/${postId}`)
// export const generateMeta   = (postId) => api.post(`/seo/meta/${postId}`)
// export const getMetaTags    = (postId) => api.get(`/seo/meta/${postId}`)

// // ─── Export ───────────────────────────────────────────────────────────────────
// export const exportMarkdown = (postId) => api.get(`/export/${postId}/markdown`, { responseType: 'blob' })
// export const exportHTML     = (postId) => api.get(`/export/${postId}/html`,     { responseType: 'blob' })

// export default api

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ─── Attach token from localStorage on every request ─────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('session')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
    config.headers['X-Session-Token'] = token
  }
  return config
})

// ─── Global 401 interceptor ──────────────────────────────────────────────────
// Skip redirect for /auth/me (failing just means not logged in)
api.interceptors.response.use(
  res => res,
  err => {
    const url = err?.config?.url || ''
    const isAuthMe = url.includes('/auth/me')
    if (err?.response?.status === 401 && !isAuthMe) {
      localStorage.removeItem('session')
      localStorage.removeItem('guestMode')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data)
export const login    = (data) => api.post('/auth/login', data)
export const logout   = ()     => api.post('/auth/logout')
export const getMe    = ()     => api.get('/auth/me')

export async function createGuestSession() {
  const uid = Math.random().toString(36).slice(2, 10)
  const username = `guest_${uid}`
  const password = `G${uid}!9x`

  await register({ username, password })
  const res = await login({ username, password })

  return {
    ...res.data,
    role: 'guest',
    username: 'Guest',
  }
}

// ─── Admin: user management ───────────────────────────────────────────────────
export const listUsers   = ()                => api.get('/auth/users')
export const setUserRole = (userId, role)    => api.patch(`/auth/users/${userId}/role`, { role })

// ─── Posts ────────────────────────────────────────────────────────────────────
export const createPost        = (data)             => api.post('/posts/', data)
export const listPosts         = (skip=0, limit=50) => api.get('/posts/', { params: { skip, limit } })
export const getPost           = (id)               => api.get(`/posts/${id}`)
export const updatePost        = (id, data)         => api.patch(`/posts/${id}`, data)
export const deletePost        = (id)               => api.delete(`/posts/${id}`)
export const regenerateOutline = (id)               => api.post(`/posts/${id}/regenerate-outline`)

// ─── Sections ─────────────────────────────────────────────────────────────────
export const generateSection     = (data)      => api.post('/sections/generate', data)
export const generateAllSections = (outlineId) => api.post(`/sections/generate-all/${outlineId}`)
export const updateSection       = (id, data)  => api.patch(`/sections/${id}`, data)
export const reorderSections     = (data)      => api.post('/sections/reorder', data)

// ─── SEO ──────────────────────────────────────────────────────────────────────
export const runSEOAnalysis = (postId) => api.post(`/seo/analyze/${postId}`)
export const getSEOAnalyses = (postId) => api.get(`/seo/analysis/${postId}`)
export const generateMeta   = (postId) => api.post(`/seo/meta/${postId}`)
export const getMetaTags    = (postId) => api.get(`/seo/meta/${postId}`)

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportMarkdown = (postId) => api.get(`/export/${postId}/markdown`, { responseType: 'blob' })
export const exportHTML     = (postId) => api.get(`/export/${postId}/html`,     { responseType: 'blob' })

export default api
