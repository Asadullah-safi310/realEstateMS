import React from 'react';
import MainLayout from '../layouts/MainLayout';

const Settings = () => {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="bg-white shadow-md rounded p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Company Name</label>
              <input type="text" defaultValue="Real Estate PMS" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
              <input type="email" placeholder="contact@realestate.com" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Phone</label>
              <input type="text" placeholder="+92-300-0000000" className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Currency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded">
                <option>PKR (Pakistani Rupee)</option>
                <option>USD (US Dollar)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Date Format</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
