import { makeAutoObservable } from 'mobx';
import axiosInstance from '../api/axiosInstance';

class PersonPropertyRoleStore {
  roles = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async getRolesByProperty(propertyId) {
    this.loading = true;
    try {
      const response = await axiosInstance.get(`/person-property-roles/property/${propertyId}`);
      this.roles = response.data;
      this.error = null;
      return response.data;
    } catch (error) {
      this.error = error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async getRolesByPerson(personId) {
    this.loading = true;
    try {
      const response = await axiosInstance.get(`/person-property-roles/person/${personId}`);
      return response.data;
    } catch (error) {
      this.error = error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async getCurrentOwner(propertyId) {
    try {
      const response = await axiosInstance.get(`/person-property-roles/property/${propertyId}/current-owner`);
      return response.data;
    } catch (error) {
      this.error = error.message;
      return null;
    }
  }

  async getCurrentTenant(propertyId) {
    try {
      const response = await axiosInstance.get(`/person-property-roles/property/${propertyId}/current-tenant`);
      return response.data;
    } catch (error) {
      this.error = error.message;
      return null;
    }
  }

  async getOwnershipHistory(propertyId) {
    this.loading = true;
    try {
      const response = await axiosInstance.get(`/person-property-roles/property/${propertyId}/history`);
      return response.data;
    } catch (error) {
      this.error = error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async assignRole(roleData) {
    this.loading = true;
    try {
      const response = await axiosInstance.post('/person-property-roles', roleData);
      this.error = null;
      return response.data;
    } catch (error) {
      this.error = error.response?.data?.message || error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async updateRole(roleId, roleData) {
    this.loading = true;
    try {
      const response = await axiosInstance.put(`/person-property-roles/${roleId}`, roleData);
      this.error = null;
      return response.data;
    } catch (error) {
      this.error = error.response?.data?.message || error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async deleteRole(roleId) {
    this.loading = true;
    try {
      await axiosInstance.delete(`/person-property-roles/${roleId}`);
      this.error = null;
      return true;
    } catch (error) {
      this.error = error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }
}

export default new PersonPropertyRoleStore();
