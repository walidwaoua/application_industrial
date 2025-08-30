import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/api/';

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// Ajouter automatiquement le token si disponible
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;
