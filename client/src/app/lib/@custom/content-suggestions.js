// @custom — content suggestions client API
import { api } from '../@system/api'

export const contentSuggestionsApi = {
  async generate({ industry, topics, tone, count }) {
    return api.post('/content-suggestions/generate', { industry, topics, tone, count })
  },

  async getOptimalTimes({ timezone, dayOfWeek } = {}) {
    return api.post('/content-suggestions/optimal-times', { timezone, dayOfWeek })
  },

  async predictPerformance({ content, format }) {
    return api.post('/content-suggestions/predict-performance', { content, format })
  },

  async getHistory({ limit = 20, offset = 0 } = {}) {
    return api.get(`/content-suggestions/history?limit=${limit}&offset=${offset}`)
  },
}
