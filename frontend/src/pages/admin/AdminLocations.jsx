import React from 'react';
import LocationManager from '../../components/admin/LocationManager';

const AdminLocations = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
      <LocationManager />
    </div>
  );
};

export default AdminLocations;
