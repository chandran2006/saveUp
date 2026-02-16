import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardAPI = {
  getSummary: async () => {
    try {
      const response = await api.get('/transactions/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  },

  getHealthScore: async () => {
    try {
      const response = await api.get('/analytics/health-score');
      return response.data;
    } catch (error) {
      console.error('Error fetching health score:', error);
      throw error;
    }
  },

  getPredictedExpense: async () => {
    try {
      const response = await api.get('/analytics/predict-expense');
      return response.data;
    } catch (error) {
      console.error('Error fetching predictions:', error);
      throw error;
    }
  },
};

export default api;
