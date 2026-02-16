import { create } from 'zustand';

// Check if we already have user info saved in the browser from a previous visit
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const useAuthStore = create((set) => ({
  userInfo: userInfoFromStorage,

  // Action: Log the user in
  setCredentials: (data) => {
    set({ userInfo: data });
    localStorage.setItem('userInfo', JSON.stringify(data));
  },

  // Action: Log the user out
  logout: () => {
    set({ userInfo: null });
    localStorage.removeItem('userInfo');
  },
}));

export default useAuthStore;