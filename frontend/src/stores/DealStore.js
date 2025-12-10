import { makeAutoObservable } from 'mobx';
import axiosInstance from '../api/axiosInstance';

class DealStore {
  deals = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchDeals() {
    this.loading = true;
    try {
      const response = await axiosInstance.get('/deals');
      this.deals = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async fetchDealById(id) {
    this.loading = true;
    try {
      const response = await axiosInstance.get(`/deals/${id}`);
      return response.data;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async createDeal(dealData) {
    this.loading = true;
    try {
      await axiosInstance.post('/deals', dealData);
      await this.fetchDeals();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.message || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
}

export default new DealStore();
