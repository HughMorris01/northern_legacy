import axios from 'axios';

const instance = axios.create({
  // In production, this falls back to the relative path, in dev it uses your .env variable
  baseURL: import.meta.env.VITE_API_URL || '', 
});

export default instance;