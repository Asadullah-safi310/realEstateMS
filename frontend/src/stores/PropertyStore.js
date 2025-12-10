import { makeAutoObservable } from 'mobx';
import axiosInstance from '../api/axiosInstance';

class PropertyStore {
  properties = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchProperties() {
    this.loading = true;
    try {
      const response = await axiosInstance.get('/properties');
      this.properties = response.data;
      this.error = null;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async fetchPropertyById(id) {
    this.loading = true;
    try {
      const response = await axiosInstance.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async searchProperties(filters) {
    this.loading = true;
    try {
      const response = await axiosInstance.get('/properties/search', { params: filters });
      this.properties = response.data;
      this.error = null;
      return response.data;
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async createProperty(propertyData) {
    this.loading = true;
    try {
      await axiosInstance.post('/properties', propertyData);
      await this.fetchProperties();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.message || error.response?.data?.error || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async updateProperty(id, propertyData) {
    this.loading = true;
    try {
      await axiosInstance.put(`/properties/${id}`, propertyData);
      await this.fetchProperties();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.message || error.response?.data?.error || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async updatePropertyStatus(id, status) {
    this.loading = true;
    try {
      await axiosInstance.patch(`/properties/${id}/status`, { status });
      await this.fetchProperties();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async deleteProperty(id) {
    this.loading = true;
    try {
      await axiosInstance.delete(`/properties/${id}`);
      await this.fetchProperties();
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.response?.data?.error || error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async uploadFiles(propertyId, files) {
    this.loading = true;
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axiosInstance.post(`/properties/${propertyId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      this.error = null;
      return response.data;
    } catch (error) {
      this.error = error.response?.data?.error || error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async deleteFile(propertyId, fileUrl, type) {
    this.loading = true;
    try {
      await axiosInstance.delete(`/properties/${propertyId}/file`, {
        data: { fileUrl, type },
      });
      await this.fetchProperties();
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

export default new PropertyStore();
