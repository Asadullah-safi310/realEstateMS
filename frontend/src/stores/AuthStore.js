import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';

class AuthStore {
  user = null;
  isAuthenticated = false;
  isLoading = true;
  error = null;

  constructor() {
    makeAutoObservable(this);
    this.checkAuth();
  }

  get isAdmin() {
    return this.user?.role === 'admin';
  }

  checkAuth = async () => {
    this.isLoading = true;
    try {
      const response = await axiosInstance.get('/auth/me');
      runInAction(() => {
        this.user = response.data;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.user = null;
        this.isAuthenticated = false;
        this.isLoading = false;
      });
    }
  };

  login = async (email, password) => {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      runInAction(() => {
        this.user = response.data;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Login failed';
        this.isLoading = false;
      });
      return false;
    }
  };

  register = async (userData) => {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      runInAction(() => {
        this.user = response.data;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Registration failed';
        this.isLoading = false;
      });
      return false;
    }
  };

  logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      runInAction(() => {
        this.user = null;
        this.isAuthenticated = false;
      });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  updateProfile = async (userData) => {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await axiosInstance.put('/profile', userData);
      runInAction(() => {
        this.user = response.data;
        this.isLoading = false;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || error.message;
        this.isLoading = false;
      });
      return false;
    }
  };
}

const authStore = new AuthStore();
export default authStore;
