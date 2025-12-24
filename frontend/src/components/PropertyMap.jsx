import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Search, MapPin, Layers, Map as MapIcon, Globe, Mountain, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 34.5553, // Kabul
  lng: 69.2075,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

const MapViewButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-2.5 transition-all rounded-full shadow-sm ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm'
    }`}
    type="button"
  >
    <Icon size={20} />
  </button>
);

const SearchBox = ({ panTo }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here if needed */
    },
    debounce: 300,
  });

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      panTo({ lat, lng });
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-full max-w-sm">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          value={value}
          onChange={handleInput}
          disabled={!ready}
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-lg"
          placeholder="Search location..."
        />
      </div>
      {status === 'OK' && (
        <ul className="absolute z-20 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm mt-1">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="truncate">{description}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const PropertyMap = ({ properties = [], apiKey }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [mapTypeId, setMapTypeId] = useState('roadmap');
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  const center = useMemo(() => {
    if (properties.length > 0) {
      const lats = properties.map(p => parseFloat(p.latitude)).filter(l => !isNaN(l));
      const lngs = properties.map(p => parseFloat(p.longitude)).filter(l => !isNaN(l));
      if (lats.length > 0 && lngs.length > 0) {
        return {
          lat: lats.reduce((a, b) => a + b, 0) / lats.length,
          lng: lngs.reduce((a, b) => a + b, 0) / lngs.length
        };
      }
    }
    return defaultCenter;
  }, [properties]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const panTo = useCallback(({ lat, lng }) => {
    if (map) {
      map.panTo({ lat, lng });
      map.setZoom(15);
    }
  }, [map]);

  if (loadError) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error loading Google Maps</div>;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-xl">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-md h-[600px]">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        mapTypeId={mapTypeId}
        options={mapOptions}
      >
        {properties.map((property) => (
          property.latitude && property.longitude ? (
            <Marker
              key={property.property_id || property.id}
              position={{
                lat: parseFloat(property.latitude),
                lng: parseFloat(property.longitude),
              }}
              onClick={() => setSelectedProperty(property)}
              animation={window.google.maps.Animation.DROP}
            />
          ) : null
        ))}

        {selectedProperty && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedProperty.latitude),
              lng: parseFloat(selectedProperty.longitude),
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="min-w-[200px] p-1">
              {selectedProperty.photos?.[0] && (
                <img 
                  src={`http://localhost:5000${selectedProperty.photos[0]}`} 
                  alt={selectedProperty.title}
                  className="w-full h-32 object-cover rounded-md mb-2"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=No+Image'; }}
                />
              )}
              <h3 className="font-bold text-gray-900 text-sm mb-1">
                {selectedProperty.property_type} - {selectedProperty.purpose}
              </h3>
              <p className="text-xs text-gray-600 mb-2 truncate">
                {selectedProperty.location}, {selectedProperty.city}
              </p>
              <div className="font-bold text-blue-600 text-sm mb-2">
                {selectedProperty.price || (selectedProperty.is_available_for_sale ? selectedProperty.sale_price : selectedProperty.rent_price)}
              </div>
              <Link 
                to={`/properties/${selectedProperty.property_id || selectedProperty.id}`}
                className="block w-full text-center bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <SearchBox panTo={panTo} />

      <div className="absolute top-1/2 right-4 z-10 flex flex-col gap-2 transform -translate-y-1/2">
        <MapViewButton active={mapTypeId === 'roadmap'} onClick={() => setMapTypeId('roadmap')} icon={MapIcon} label="Map" />
        <MapViewButton active={mapTypeId === 'satellite'} onClick={() => setMapTypeId('satellite')} icon={Globe} label="Satellite" />
        <MapViewButton active={mapTypeId === 'hybrid'} onClick={() => setMapTypeId('hybrid')} icon={Layers} label="Hybrid" />
        <MapViewButton active={mapTypeId === 'terrain'} onClick={() => setMapTypeId('terrain')} icon={Mountain} label="Terrain" />
      </div>
    </div>
  );
};

export default PropertyMap;
