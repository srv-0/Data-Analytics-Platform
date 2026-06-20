import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

export const uploadCSV = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload/csv', form)
}

export const getStats = (sessionId, columns) =>
  api.post('/analyze/stats', { session_id: sessionId, columns })

export const getCorrelation = (sessionId) =>
  api.post('/analyze/correlation', { session_id: sessionId })

export const getDistribution = (sessionId, columns) =>
  api.post('/analyze/distribution', { session_id: sessionId, columns })

export const runPredict = (sessionId, payload) =>
  api.post('/predict/run', { session_id: sessionId, ...payload })

export const getInsights = (sessionId) =>
  api.post('/insights/auto', { session_id: sessionId })
