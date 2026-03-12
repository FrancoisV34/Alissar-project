import { create } from 'zustand';

function loadFromStorage() {
  try {
    const token = localStorage.getItem('alissar-token');
    const user = JSON.parse(localStorage.getItem('alissar-user') ?? 'null');
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
    localStorage.setItem('alissar-token', token);
    localStorage.setItem('alissar-user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (user, token) => {
    localStorage.setItem('alissar-token', token);
    localStorage.setItem('alissar-user', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('alissar-token');
    localStorage.removeItem('alissar-user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useStore;
