import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import FavoriteStore from '../../stores/FavoriteStore';
import authStore from '../../stores/AuthStore';
import { useNavigate } from 'react-router-dom';

const PropertyCard = observer(({ property }) => {
  const navigate = useNavigate();
  const {
    property_id,
    photos,
    sale_price,
    rent_price,
    property_type,
    purpose,
    location,
    city,
    bedrooms,
    bathrooms,
    area_size,
    is_available_for_sale,
    is_available_for_rent
  } = property;

  const price = purpose === 'SALE' ? sale_price : rent_price;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price);

  const coverImage = photos && photos.length > 0 
    ? `http://localhost:5000${photos[0]}` 
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={coverImage} 
          alt={`${property_type} in ${city}`} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
            purpose === 'SALE' ? 'bg-blue-600' : 'bg-green-600'
          }`}>
            For {purpose}
          </span>
          {property_type && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-900/60 backdrop-blur-sm text-white shadow-sm">
              {property_type}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!authStore.isAuthenticated) {
              navigate('/admin/login'); // Redirect to login if not authenticated
              return;
            }
            FavoriteStore.toggleFavorite(property_id);
          }}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors shadow-sm ${
            FavoriteStore.isFavorite(property_id)
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart size={18} fill={FavoriteStore.isFavorite(property_id) ? "currentColor" : "none"} />
        </button>

        {/* Price Overlay */}
        <div className="absolute bottom-4 left-4">
          <span className="text-2xl font-bold text-white drop-shadow-md">
            {formattedPrice}
            {purpose === 'RENT' && <span className="text-sm font-normal text-gray-100">/mo</span>}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {property_type} in {city}
            </h3>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin size={14} className="mr-1" />
              <span className="line-clamp-1">{location}, {city}</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center justify-between py-4 border-t border-gray-100 mt-4">
          <div className="flex items-center gap-1 text-gray-600" title="Bedrooms">
            <Bed size={18} className="text-blue-500" />
            <span className="text-sm font-medium">{bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600" title="Bathrooms">
            <Bath size={18} className="text-blue-500" />
            <span className="text-sm font-medium">{bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600" title="Area Size">
            <Square size={18} className="text-blue-500" />
            <span className="text-sm font-medium">{area_size}</span>
          </div>
        </div>

        {/* Action */}
        <Link 
          to={`/properties/${property_id}`}
          className="block w-full text-center py-2.5 mt-2 rounded-xl bg-gray-50 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
});

export default PropertyCard;
