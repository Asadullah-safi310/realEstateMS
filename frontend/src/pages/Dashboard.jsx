import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import MainLayout from '../layouts/MainLayout';
import OwnerStore from '../stores/OwnerStore';
import PropertyStore from '../stores/PropertyStore';
import ClientStore from '../stores/ClientStore';
import DealStore from '../stores/DealStore';

const Dashboard = observer(() => {
  useEffect(() => {
    OwnerStore.fetchOwners();
    PropertyStore.fetchProperties();
    ClientStore.fetchClients();
    DealStore.fetchDeals();
  }, []);

  const availableProperties = PropertyStore.properties.filter(p => p.status === 'available').length;
  const soldProperties = PropertyStore.properties.filter(p => p.status === 'sold').length;
  const rentedProperties = PropertyStore.properties.filter(p => p.status === 'rented').length;

  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-gray-600 text-sm font-semibold">Total Owners</h3>
            <p className="text-3xl font-bold text-blue-600">{OwnerStore.owners.length}</p>
          </div>
          
          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-gray-600 text-sm font-semibold">Total Properties</h3>
            <p className="text-3xl font-bold text-green-600">{PropertyStore.properties.length}</p>
          </div>

          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-gray-600 text-sm font-semibold">Total Clients</h3>
            <p className="text-3xl font-bold text-purple-600">{ClientStore.clients.length}</p>
          </div>

          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-gray-600 text-sm font-semibold">Total Deals</h3>
            <p className="text-3xl font-bold text-orange-600">{DealStore.deals.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-gray-600 text-sm font-semibold">Available Properties</h3>
            <p className="text-2xl font-bold text-blue-600">{availableProperties}</p>
          </div>

          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-gray-600 text-sm font-semibold">Sold Properties</h3>
            <p className="text-2xl font-bold text-green-600">{soldProperties}</p>
          </div>

          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-gray-600 text-sm font-semibold">Rented Properties</h3>
            <p className="text-2xl font-bold text-purple-600">{rentedProperties}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
});

export default Dashboard;
