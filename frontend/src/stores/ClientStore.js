import { makeAutoObservable } from 'mobx';
import axiosInstance from '../api/axiosInstance';

class ClientStore {
  clients = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchClients() {
    this.loading = true;
    try {
      const response = await axiosInstance.get('/clients');
      this.clients = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async fetchClientById(id) {
    this.loading = true;
    try {
      const response = await axiosInstance.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async createClient(clientData) {
    this.loading = true;
    try {
      await axiosInstance.post('/clients', clientData);
      await this.fetchClients();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.message || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async deleteClient(id) {
    this.loading = true;
    try {
      await axiosInstance.delete(`/clients/${id}`);
      await this.fetchClients();
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

export default new ClientStore();
