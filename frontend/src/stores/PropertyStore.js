import { makeAutoObservable, runInAction } from 'mobx';
import axiosInstance from '../api/axiosInstance';

class PropertyStore {
  properties = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchProperties() {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await axiosInstance.get('/properties');
      runInAction(() => {
        this.properties = response.data;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async fetchPropertyById(id) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await axiosInstance.get(`/properties/${id}`);
      runInAction(() => {
        this.loading = false;
      });
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
    }
  }

  async searchProperties(filters) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      const response = await axiosInstance.get('/properties/search', { params: filters });
      runInAction(() => {
        this.properties = response.data;
        this.error = null;
        this.loading = false;
      });
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
    }
  }

  async createProperty(propertyData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await axiosInstance.post('/properties', propertyData);
      await this.fetchProperties();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || error.response?.data?.error || error.message;
        this.loading = false;
      });
      return false;
    }
  }

  async updateProperty(id, propertyData) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await axiosInstance.put(`/properties/${id}`, propertyData);
      await this.fetchProperties();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || error.response?.data?.error || error.message;
        this.loading = false;
      });
      return false;
    }
  }

  async updatePropertyStatus(id, status) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await axiosInstance.patch(`/properties/${id}/status`, { status });
      await this.fetchProperties();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      return false;
    }
  }

  async deleteProperty(id) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await axiosInstance.delete(`/properties/${id}`);
      await this.fetchProperties();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.error || error.message;
        this.loading = false;
      });
      return false;
    }
  }

  async uploadFiles(propertyId, files) {
    runInAction(() => {
      this.loading = true;
    });
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
      runInAction(() => {
        this.error = null;
        this.loading = false;
      });
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.error || error.message;
        this.loading = false;
      });
      return null;
    }
  }

  async deleteFile(propertyId, fileUrl, type) {
    runInAction(() => {
      this.loading = true;
    });
    try {
      await axiosInstance.delete(`/properties/${propertyId}/file`, {
        data: { fileUrl, type },
      });
      await this.fetchProperties();
      runInAction(() => {
        this.error = null;
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.error || error.message;
        this.loading = false;
      });
      return false;
    }
  }
}

export default new PropertyStore();
