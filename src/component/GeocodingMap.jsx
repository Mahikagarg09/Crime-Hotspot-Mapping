import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// MapUpdater component to handle map view updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// MapClickHandler component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const GeocodingMap = ({setFormData, onClose, setSelectedLocation}) => {
  const [address, setAddress] = useState('');
  const [marker, setMarker] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const defaultCenter = [28.63, 77.23];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedAddress, setSelectedAddress] = useState('');

  const geocodeAddress = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();

      if (data.length === 0) {
        setError('No results found');
        return;
      }

      const location = data[0];
      const newMarker = {
        position: [parseFloat(location.lat), parseFloat(location.lon)],
        popupContent: location.display_name,
      };

      setMarker(newMarker);
      setMapCenter(newMarker.position);
      setMapZoom(16);
      setSelectedAddress(location.display_name);
    } catch (err) {
      setError('Error occurred while geocoding');
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (latlng) => {
    try {
      // Reverse geocoding to get address for clicked location
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();
      
      const newMarker = {
        position: [latlng.lat, latlng.lng],
        popupContent: data.display_name,
      };
      
      setMarker(newMarker);
      setSelectedAddress(data.display_name);
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      // Still update marker position even if reverse geocoding fails
      setMarker({
        position: [latlng.lat, latlng.lng],
        popupContent: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`,
      });
    }
  };

  const handleMarkerDrag = async (e) => {
    const latlng = e.target.getLatLng();
    handleMapClick(latlng);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      geocodeAddress();
    }
  };

  const handleSelectLocation = () => {
    const location = {
      address: selectedAddress,
      coordinates: [marker.position[0], marker.position[1]]
    }
    console.log(location);
    setFormData(prev => ({
      ...prev,
      location: location
    }))
    
    setSelectedLocation(location)
    onClose()
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter an address"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={geocodeAddress}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {selectedAddress && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Selected Location: </span>
            {selectedAddress}
          </p>
          {marker && (
            <p className="text-sm text-blue-700 mt-1">
              {/* <span className="font-medium">Coordinates: </span> */}
              {/* {marker.position[0].toFixed(6)}, {marker.position[1].toFixed(6)} */}
            </p>
          )}
        </div>
      )}

      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <MapClickHandler onMapClick={handleMapClick} />

          {marker && (
            <Marker 
              position={marker.position}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDrag,
              }}
            >
              <Popup>
                <div className="text-sm">{marker.popupContent}</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

<div className='flex justify-between'>

      <div className="text-sm text-gray-600">
        <p>You can:</p>
        <ul className="list-disc ml-5 mt-1">
          <li>Search for a location using the search bar</li>
          <li>Click anywhere on the map to place the marker</li>
          <li>Drag the marker to adjust its position</li>
        </ul>
      </div>
      <div>
        <button className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors' onClick={handleSelectLocation}>Select Location</button>
      </div>
</div>
    </div>
  );
};

export default GeocodingMap;