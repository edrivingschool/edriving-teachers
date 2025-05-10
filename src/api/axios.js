import axios from 'axios';

const instance = axios.create({
  baseURL:'https://driving-backend-stmb.onrender.com',
});

instance.interceptors.request.use((config) => {
  const token = 4;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;