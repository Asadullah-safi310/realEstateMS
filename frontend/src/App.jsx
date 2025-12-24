import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { observer } from 'mobx-react-lite';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Stores
import authStore from './stores/AuthStore';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

// Public Pages
import PublicDashboard from './pages/PublicDashboard';
import PublicPropertyDetails from './pages/PublicPropertyDetails';
import SearchProperties from './pages/SearchProperties';

// Authenticated Pages
import MyDashboard from './pages/protected/MyDashboard';
import MyProperties from './pages/protected/MyProperties';
import AddPropertyProtected from './pages/protected/AddProperty';
import MyDeals from './pages/protected/MyDeals';
import ProfileManagement from './pages/protected/ProfileManagement';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminDeals from './pages/admin/AdminDeals';
import AdminLocations from './pages/admin/AdminLocations';
import AdminSettings from './pages/admin/AdminSettings';

// Legacy Pages (Keep only if needed, otherwise remove)
import Dashboard from './pages/Dashboard';
import OwnerList from './pages/OwnerList';
import AddOwner from './pages/AddOwner';
import PropertyList from './pages/PropertyList';
import AddProperty from './pages/AddProperty';
import PersonDetails from './pages/PersonDetails';
import ClientList from './pages/ClientList';
import AddClient from './pages/AddClient';
import DealList from './pages/DealList';
import CreateDeal from './pages/CreateDeal';
import Settings from './pages/Settings';
import Favorites from './pages/Favorites';

const RequireAuth = observer(({ children }) => {
  if (authStore.isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  if (!authStore.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
});

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastContainer position="bottom-right" />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/properties/search" element={<SearchProperties />} />
          <Route path="/properties/:id" element={<PublicPropertyDetails />} />
        </Route>

        {/* Authenticated Routes */}
        <Route path="/authenticated" element={
          <RequireAuth>
            <AuthenticatedLayout />
          </RequireAuth>
        }>
          <Route path="dashboard" element={<MyDashboard />} />
          <Route path="properties" element={<MyProperties />} />
          <Route path="properties/add" element={<AddPropertyProtected />} />
          <Route path="properties/edit/:id" element={<AddPropertyProtected />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="deals" element={<MyDeals />} />
          <Route path="profile" element={<ProfileManagement />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Legacy Routes (To be deprecated) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/owners" element={<OwnerList />} />
        <Route path="/owners/add" element={<AddOwner />} />
        <Route path="/owners/:id" element={<AddOwner />} />
        <Route path="/person-details/:id" element={<PersonDetails />} />
        
        <Route path="/admin/properties" element={<PropertyList />} />
        <Route path="/properties/add" element={<AddProperty />} />
        <Route path="/properties/edit/:id" element={<AddProperty />} />
        
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/add" element={<AddClient />} />
        
        <Route path="/deals" element={<DealList />} />
        <Route path="/deals/add" element={<CreateDeal />} />
        <Route path="/create-deal" element={<CreateDeal />} />
        
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
