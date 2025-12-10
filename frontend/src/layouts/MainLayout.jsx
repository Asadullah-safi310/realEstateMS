import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import useTranslation from '../hooks/useTranslation';
import LanguageSelector from '../components/LanguageSelector';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="bg-gray-900 text-white w-64 h-screen p-4 overflow-y-auto flex flex-col">
        <h1 className="text-2xl font-bold mb-8">{t('common.appName')}</h1>
        <nav className="space-y-2 flex-1">
          <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-800">{t('navigation.dashboard')}</Link>
          
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 px-4 mb-2">{t('navigation.owners')}</h3>
            <Link to="/owners" className="block px-4 py-2 rounded hover:bg-gray-800">{t('owners.title')}</Link>
            <Link to="/owners/add" className="block px-4 py-2 rounded hover:bg-gray-800">{t('owners.addOwner')}</Link>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 px-4 mb-2">{t('navigation.properties')}</h3>
            <Link to="/properties" className="block px-4 py-2 rounded hover:bg-gray-800">{t('properties.title')}</Link>
            <Link to="/properties/add" className="block px-4 py-2 rounded hover:bg-gray-800">{t('properties.addProperty')}</Link>
            <Link to="/properties/search" className="block px-4 py-2 rounded hover:bg-gray-800">{t('common.search')}</Link>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 px-4 mb-2">{t('navigation.clients')}</h3>
            <Link to="/clients" className="block px-4 py-2 rounded hover:bg-gray-800">{t('clients.title')}</Link>
            <Link to="/clients/add" className="block px-4 py-2 rounded hover:bg-gray-800">{t('clients.addClient')}</Link>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 px-4 mb-2">{t('navigation.deals')}</h3>
            <Link to="/deals" className="block px-4 py-2 rounded hover:bg-gray-800">{t('deals.title')}</Link>
            <Link to="/deals/add" className="block px-4 py-2 rounded hover:bg-gray-800">{t('deals.addDeal')}</Link>
          </div>

          <div className="mt-6">
            <Link to="/settings" className="block px-4 py-2 rounded hover:bg-gray-800">{t('navigation.settings')}</Link>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-700">
          <LanguageSelector />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default observer(MainLayout);
