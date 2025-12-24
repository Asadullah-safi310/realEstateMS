import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { Search, MapPin, Loader2, Layers, Map as MapIcon, Globe, Mountain } from 'lucide-react';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 34.5553, // Kabul
  lng: 69.2075,
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

const LocationPicker = ({ setFieldValue, values, apiKey }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapTypeId, setMapTypeId] = useState('roadmap');

  // Initialize marker from values if available
  useEffect(() => {
    if (values.latitude && values.longitude) {
      const pos = {
        lat: parseFloat(values.latitude),
        lng: parseFloat(values.longitude),
      };
      setMarkerPosition(pos);
    }
  }, [values.latitude, values.longitude]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
    if (values.latitude && values.longitude) {
      map.panTo({
        lat: parseFloat(values.latitude),
        lng: parseFloat(values.longitude),
      });
    }
  }, [values.latitude, values.longitude]);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    updateLocation(lat, lng);
  };

  const handleMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    updateLocation(lat, lng);
  };

  const updateLocation = async (lat, lng) => {
    setMarkerPosition({ lat, lng });
    setFieldValue('latitude', lat);
    setFieldValue('longitude', lng);
  };

  if (loadError) {
    return <div className="text-red-500">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PlacesAutocomplete 
        setFieldValue={setFieldValue} 
        setMarkerPosition={setMarkerPosition}
        map={map}
      />

      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPosition || defaultCenter}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          mapTypeId={mapTypeId}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              animation={window.google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
        
        {!markerPosition && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm font-medium text-gray-600 pointer-events-none">
            Click on map or search to set location
          </div>
        )}

        {/* Map Type Controls */}
        <div className="absolute top-1/2 right-4 z-10 flex flex-col gap-2 transform -translate-y-1/2">
          <MapViewButton active={mapTypeId === 'roadmap'} onClick={() => setMapTypeId('roadmap')} icon={MapIcon} label="Map" />
          <MapViewButton active={mapTypeId === 'satellite'} onClick={() => setMapTypeId('satellite')} icon={Globe} label="Satellite" />
          <MapViewButton active={mapTypeId === 'hybrid'} onClick={() => setMapTypeId('hybrid')} icon={Layers} label="Hybrid" />
          <MapViewButton active={mapTypeId === 'terrain'} onClick={() => setMapTypeId('terrain')} icon={Mountain} label="Terrain" />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <MapPin size={12} />
        <span>
          {markerPosition 
            ? `Selected: ${markerPosition.lat.toFixed(6)}, ${markerPosition.lng.toFixed(6)}`
            : 'No location selected'}
        </span>
      </div>
    </div>
  );
};

const PlacesAutocomplete = ({ setFieldValue, setMarkerPosition, map }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300,
  });

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      setFieldValue('address', address);
      setFieldValue('location', address); // Update location field too
      setFieldValue('latitude', lat);
      setFieldValue('longitude', lng);
      
      setMarkerPosition({ lat, lng });
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(15);
      }
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Search for a location..."
        />
      </div>
      
      {status === 'OK' && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0"
            >
              <MapPin size={14} className="inline mr-2 text-gray-400" />
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationPicker;
