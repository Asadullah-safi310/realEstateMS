import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import Dashboard from './pages/Dashboard';
import OwnerList from './pages/OwnerList';
import AddOwner from './pages/AddOwner';
import PropertyList from './pages/PropertyList';
import AddProperty from './pages/AddProperty';
import SearchProperties from './pages/SearchProperties';
import ClientList from './pages/ClientList';
import AddClient from './pages/AddClient';
import DealList from './pages/DealList';
import AddDeal from './pages/AddDeal';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/owners" element={<OwnerList />} />
        <Route path="/owners/add" element={<AddOwner />} />
        <Route path="/owners/:id" element={<AddOwner />} />
        
        <Route path="/properties" element={<PropertyList />} />
        <Route path="/properties/add" element={<AddProperty />} />
        <Route path="/properties/:id" element={<AddProperty />} />
        <Route path="/properties/search" element={<SearchProperties />} />
        
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/add" element={<AddClient />} />
        
        <Route path="/deals" element={<DealList />} />
        <Route path="/deals/add" element={<AddDeal />} />
        
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
