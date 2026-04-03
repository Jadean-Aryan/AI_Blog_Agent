import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login    = (data) => api.post('/auth/login', data)
export const logout   = ()     => api.post('/auth/logout')
export const getMe    = ()     => api.get('/auth/me')

// Posts
export const createPost        = (data) => api.post('/posts/', data)
export const listPosts         = (skip=0, limit=50) => api.get('/posts/', { params: { skip, limit } })
export const getPost           = (id) => api.get(`/posts/${id}`)
export const updatePost        = (id, data) => api.patch(`/posts/${id}`, data)
export const deletePost        = (id) => api.delete(`/posts/${id}`)
export const regenerateOutline = (id) => api.post(`/posts/${id}/regenerate-outline`)

// Sections
export const generateSection     = (data) => api.post('/sections/generate', data)
export const generateAllSections = (outlineId) => api.post(`/sections/generate-all/${outlineId}`)
export const updateSection       = (id, data) => api.patch(`/sections/${id}`, data)
export const reorderSections     = (data) => api.post('/sections/reorder', data)

// SEO
export const runSEOAnalysis = (postId) => api.post(`/seo/analyze/${postId}`)
export const getSEOAnalyses = (postId) => api.get(`/seo/analysis/${postId}`)
export const generateMeta   = (postId) => api.post(`/seo/meta/${postId}`)
export const getMetaTags    = (postId) => api.get(`/seo/meta/${postId}`)

// Export
export const exportMarkdown = (postId) => api.get(`/export/${postId}/markdown`, { responseType: 'blob' })
export const exportHTML     = (postId) => api.get(`/export/${postId}/html`, { responseType: 'blob' })

export default api
