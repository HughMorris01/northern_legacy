import axios from 'axios';
import useAuthStore from './store/authStore';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', 
  withCredentials: true 
});

// The Interceptor: Listens to all incoming responses from the server
instance.interceptors.response.use(
  (response) => response, // If the response is good, just pass it through
  (error) => {
    // If the server says 401 Unauthorized (expired or missing token)
    if (error.response && error.response.status === 401) {
      // Reach into Zustand store and trigger the logout action
      useAuthStore.getState().logout();
      // Optional: Force them back to the login screen
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;