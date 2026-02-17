import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from '../axios';

const AutoLogoutHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const userInfo = useAuthStore((state) => state.userInfo);
  
  const timerRef = useRef(null);
  const timeoutLimit = 60 * 60 * 1000; // 1 Hour

  const handleLogout = useCallback(async () => {
    try {
      await axios.post('/api/users/logout');
      logout();
      navigate('/', { state: { message: 'Security Logout Due to Inactivity' } }); 
    } catch {
      logout();
      navigate('/', { state: { message: 'Security Logout Due to Inactivity' } });
    }
  }, [logout, navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (userInfo) {
      timerRef.current = setTimeout(handleLogout, timeoutLimit);
    }
  }, [userInfo, handleLogout, timeoutLimit]);

  // 1. INACTIVITY TIMER
  useEffect(() => {
    if (!userInfo) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userInfo, resetTimer, location]);

  // 2. NEW: BACKGROUND SESSION POLLING
  useEffect(() => {
    if (!userInfo) return;

    // Silently ping the backend every 15 seconds
    const sessionCheckInterval = setInterval(async () => {
      try {
        // We ping /profile just to trigger the authMiddleware check
        await axios.get('/api/users/profile');
      } catch (error) {
        // If the backend throws a 401, the phone stole the session token!
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/', { state: { message: 'Security Alert: Your account was accessed from another device.' } });
        }
      }
    }, 15000); // 15000 ms = 15 seconds

    return () => clearInterval(sessionCheckInterval);
  }, [userInfo, logout, navigate]);

  return children;
};

export default AutoLogoutHandler;