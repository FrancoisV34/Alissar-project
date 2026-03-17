import { create } from 'zustand';

function loadFromStorage() {
  try {
    const token = localStorage.getItem('mb-token');
    const user = JSON.parse(localStorage.getItem('mb-user') ?? 'null');
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

const { token: storedToken, user: storedUser } = loadFromStorage();

const useStore = create((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken && !!storedUser,

  login: (user, token) => {
    localStorage.setItem('mb-token', token);
    localStorage.setItem('mb-user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (user, token) => {
    localStorage.setItem('mb-token', token);
    localStorage.setItem('mb-user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('mb-token');
    localStorage.removeItem('mb-user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useStore;
