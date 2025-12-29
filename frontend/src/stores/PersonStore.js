import { makeAutoObservable } from 'mobx';
import axiosInstance from '../api/axiosInstance';

class PersonStore {
  persons = [];
  agents = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchPersons() {
    this.loading = true;
    try {
      const response = await axiosInstance.get('/persons');
      this.persons = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async fetchAgents() {
    this.loading = true;
    try {
      const response = await axiosInstance.get('/persons/agents/list');
      this.agents = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async fetchPersonById(id) {
    this.loading = true;
    try {
      const response = await axiosInstance.get(`/persons/${id}`);
      this.error = null;
      return response.data;
    } catch (error) {
      this.error = error.response?.data?.message || error.response?.data?.error || error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async createPerson(personData) {
    this.loading = true;
    try {
      const config = personData instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      await axiosInstance.post('/persons', personData, config);
      await this.fetchPersons();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.message || error.response?.data?.error || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async updatePerson(id, personData) {
    this.loading = true;
    try {
      const config = personData instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      await axiosInstance.put(`/persons/${id}`, personData, config);
      await this.fetchPersons();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.message || error.response?.data?.error || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async deletePerson(id) {
    this.loading = true;
    try {
      await axiosInstance.delete(`/persons/${id}`);
      await this.fetchPersons();
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

export default new PersonStore();
