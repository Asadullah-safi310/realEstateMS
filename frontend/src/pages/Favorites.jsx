import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Heart, Loader2 } from 'lucide-react';
import PropertyStore from '../stores/PropertyStore';
import FavoriteStore from '../stores/FavoriteStore';
import PropertyCard from '../components/public/PropertyCard';

const Favorites = observer(() => {
  useEffect(() => {
    // Ensure properties are loaded so we can display them
    if (PropertyStore.properties.length === 0) {
      PropertyStore.fetchProperties();
    }
  }, []);

  // Filter properties that are in the favorites list
  const favoriteProperties = PropertyStore.properties.filter(property => 
    FavoriteStore.isFavorite(property.property_id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-100 rounded-xl text-red-600">
          <Heart size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-500">
            {favoriteProperties.length} properties saved
          </p>
        </div>
      </div>

      {PropertyStore.loading && PropertyStore.properties.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      ) : favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map(property => (
            <PropertyCard key={property.property_id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-6">
            Start exploring properties and click the heart icon to save them here.
          </p>
        </div>
      )}
    </div>
  );
});

export default Favorites;
