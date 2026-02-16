import axios from 'axios';
import useAuthStore from './store/authStore';
import useCartStore from './store/cartStore';

// Create the custom instance
const instance = axios.create({
  // The empty string makes it ping Vercel in production, and localhost in development
  baseURL: '', 
  withCredentials: true,
});

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx causes this function to trigger
    if (error.response && error.response.status === 401) {
      // The backend rejected the token (expired or invalid)!
      
      // 1. Wipe the auth state
      useAuthStore.getState().logout();
      
      // 2. Wipe the cart state
      useCartStore.getState().clearCart();
      
      // 3. Kick them back to the login screen
      // Note: We use window.location here because React Router's 'useNavigate' hook 
      // can only be used inside React Components, not inside pure JS files like this one.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;