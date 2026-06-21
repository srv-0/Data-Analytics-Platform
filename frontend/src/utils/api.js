import axios from 'axios'

const api = axios.create({ 
  baseURL: 'https://data-analytics-platform-nfoz.onrender.com',
  timeout: 60000
})

export const uploadCSV = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/api/upload/csv', form)
}

export const getStats = (sessionId, columns) =>
  api.post('/api/analyze/stats', { session_id: sessionId, columns })

export const getCorrelation = (sessionId) =>
  api.post('/api/analyze/correlation', { session_id: sessionId })

export const getDistribution = (sessionId, columns) =>
  api.post('/api/analyze/distribution', { session_id: sessionId, columns })

export const runPredict = (sessionId, payload) =>
  api.post('/api/predict/run', { session_id: sessionId, ...payload })

export const getInsights = (sessionId) =>
  api.post('/api/insights/auto', { session_id: sessionId })
