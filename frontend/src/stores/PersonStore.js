import { makeAutoObservable } from 'mobx';
import axiosInstance from '../api/axiosInstance';

class PersonStore {
  persons = [];
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

  async fetchPersonById(id) {
    this.loading = true;
    try {
      const response = await axiosInstance.get(`/persons/${id}`);
      return response.data;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async createPerson(personData) {
    this.loading = true;
    try {
      await axiosInstance.post('/persons', personData);
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
      await axiosInstance.put(`/persons/${id}`, personData);
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
