import { useState, useEffect, useRef } from "react";


// Map Component
export const Map = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!mapRef.current) return;

    const initialLocation = { lat: 51.505, lng: -0.09 }; // Default location (London)
    
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 13,
      center: initialLocation,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    setMap(mapInstance);

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstance.setCenter(userLocation);
        },
        () => {
          console.log("Error: The Geolocation service failed.");
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!map) return;

    const geocoder = new google.maps.Geocoder();

    const handleMapClick = (event) => {
      const clickedLocation = event.latLng;

      // Remove existing marker if any
      if (marker) {
        marker.setMap(null);
      }

      // Add new marker
      const newMarker = new google.maps.Marker({
        position: clickedLocation,
        map: map,
        animation: google.maps.Animation.DROP,
      });

      setMarker(newMarker);

      // Get address for clicked location
      geocoder.geocode({ location: clickedLocation }, (results, status) => {
        if (status === "OK" && results[0]) {
          const clickedAddress = results[0].formatted_address;
          setAddress(clickedAddress);
          onLocationSelect({
            address: clickedAddress,
            lat: clickedLocation.lat(),
            lng: clickedLocation.lng(),
          });
        } else {
          setAddress(`${clickedLocation.lat()}, ${clickedLocation.lng()}`);
          onLocationSelect({
            address: `${clickedLocation.lat()}, ${clickedLocation.lng()}`,
            lat: clickedLocation.lat(),
            lng: clickedLocation.lng(),
          });
        }
      });
    };

    const clickListener = map.addListener("click", handleMapClick);

    return () => {
      google.maps.event.removeListener(clickListener);
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [map, marker, onLocationSelect]);

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Location on Map</h3>
      <div className="h-96 rounded-lg overflow-hidden">
        <div ref={mapRef} className="h-full w-full" />
      </div>
      {address && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Selected location:</p>
          <p className="text-sm font-medium text-gray-900">{address}</p>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-500">
        Click on the map to select a location
      </div>
    </div>
  );
};