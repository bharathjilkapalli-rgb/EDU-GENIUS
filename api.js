import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.detail || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

// Documents
export const uploadDocument = (file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const listDocuments = () => api.get('/upload/')
export const getDocument = (id) => api.get(`/upload/${id}`)
export const deleteDocument = (id) => api.delete(`/upload/${id}`)

// Quiz
export const generateQuiz = (data) => api.post('/quiz/generate', data)
export const listQuizzes = () => api.get('/quiz/')
export const getQuiz = (id) => api.get(`/quiz/${id}`)
export const submitAttempt = (data) => api.post('/quiz/attempt', data)
export const getAttempts = (quizId) => api.get(`/quiz/${quizId}/attempts`)

// Flashcards
export const generateFlashcards = (data) => api.post('/flashcards/generate', data)
export const listFlashcardSets = () => api.get('/flashcards/sets')
export const getFlashcardSet = (id) => api.get(`/flashcards/sets/${id}`)
export const getDueCards = (setId) => api.get(`/flashcards/sets/${setId}/due`)
export const reviewCard = (data) => api.post('/flashcards/review', data)

// Audio / Summary
export const createAudioSummary = (data) => api.post('/audio/summary', data)

// Chat
export const chatWithDoc = (data) => api.post('/chat/', data)

// Analytics
export const getDashboard = () => api.get('/analytics/dashboard')

export default api
