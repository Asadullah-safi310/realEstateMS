import { makeAutoObservable } from 'mobx';
import axiosInstance from '../api/axiosInstance';

class OwnerStore {
  owners = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchOwners() {
    this.loading = true;
    try {
      const response = await axiosInstance.get('/owners');
      this.owners = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async fetchOwnerById(id) {
    this.loading = true;
    try {
      const response = await axiosInstance.get(`/owners/${id}`);
      return response.data;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async createOwner(ownerData) {
    this.loading = true;
    try {
      await axiosInstance.post('/owners', ownerData);
      await this.fetchOwners();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.message || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async updateOwner(id, ownerData) {
    this.loading = true;
    try {
      await axiosInstance.put(`/owners/${id}`, ownerData);
      await this.fetchOwners();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.message || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async deleteOwner(id) {
    this.loading = true;
    try {
      await axiosInstance.delete(`/owners/${id}`);
      await this.fetchOwners();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.error || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
}

export default new OwnerStore();
