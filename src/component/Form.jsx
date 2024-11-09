import { useState } from "react";
import crimeType from '../constants/crimeType';
import { database } from "../firebase/firebase"; 
import { ref, set } from "firebase/database";
import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// Map Selection Component
const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    },
  });

  return position === null ? null : <Marker position={position} />;
};
const Form = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    crimeType: "",
    location: "",
    crimeDescription: "",
    victimName: "",
    victimContact: "",
    victimAge: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = async () => {
    setIsMapOpen(true);
  };

  const handleMapLocationSelect = async (location) => {
    try {
      // Reverse geocoding using Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location[0]}&lon=${location[1]}`
      );
      const data = await response.json();
      console.log(data);
      
      
      const address = data.display_name;
      setSelectedLocation(location);
      handleInputChange("location", address);
      setIsMapOpen(false);
    } catch (error) {
      console.error("Error getting address:", error);
      // Fallback to coordinates if geocoding fails
      const coords = `${location[0].toFixed(6)}, ${location[1].toFixed(6)}`;
      setSelectedLocation(location);
      handleInputChange("location", coords);
      setIsMapOpen(false);
    }
  };

  // ... Rest of the validation and form submission logic remains the same ...
  const validateForm = () => {
    if (!formData.crimeType) return "Please select a crime type";
    if (!formData.location) return "Please select a location";
    if (!formData.crimeDescription) return "Please provide a crime description";
    if (!formData.victimName) return "Please enter victim's name";
    if (!formData.victimContact) return "Please enter contact information";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitSuccess(false);

    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const reportId = Date.now().toString(); // Timestamp as a simple ID

      // Define the reference to where the data will be stored
      const reportRef = ref(database, 'reports/' + reportId);

      // Write the data to Firebase Realtime Database
      await set(reportRef, {
        crime: formData.crime,
        location: formData.location,
        crimeDescription: formData.crimeDescription,
        victimName: formData.victimName,
        victimContact: formData.victimContact,
        victimAge: formData.victimAge,
      });
     
      setSubmitSuccess(true);
      console.log(formData);
      
      setSubmitSuccess(true);
      setFormData({
        crimeType: "",
        location: "",
        crimeDescription: "",
        victimName: "",
        victimContact: "",
        victimAge: ""
      });
      setSelectedLocation(null);
    } catch (error) {
      setFormError("Failed to submit report. Please try again.");
      console.log(error)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-white border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Crime Report Form</h2>
        <p className="mt-1 text-sm text-gray-600">Please fill in all required information about the incident</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crime Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Crime Type
            </label>
            <select
              value={formData.crimeType}
              onChange={(e) => handleInputChange("crimeType", e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select crime type</option>
              {["Theft", "Assault", "Vandalism", "Fraud", "Harassment", "Breaking and Entering", "Other"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="flex gap-2">
              <input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Click 'Select Location' to choose on map"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                readOnly
              />
              <button
                type="button"
                onClick={handleLocationSelect}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Select Location
              </button>
            </div>
          </div>

          {/* Rest of the form fields remain the same ... */}
          {/* Crime Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description of Incident
            </label>
            <textarea
              value={formData.crimeDescription}
              onChange={(e) => handleInputChange("crimeDescription", e.target.value)}
              placeholder="Please provide detailed information about the incident"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Victim Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Victim's Name
              </label>
              <input
                value={formData.victimName}
                onChange={(e) => handleInputChange("victimName", e.target.value)}
                placeholder="Full name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Victim's Age
              </label>
              <input
                value={formData.victimAge}
                onChange={(e) => handleInputChange("victimAge", e.target.value)}
                type="number"
                placeholder="Age"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                value={formData.victimContact}
                onChange={(e) => handleInputChange("victimContact", e.target.value)}
                type="tel"
                placeholder="Phone number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Error and Success Messages */}
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">Report submitted successfully!</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Report"
            )}
          </button>
        </form>
      </div>

      {/* Map Modal */}
      <Modal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Location on Map</h3>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              className="h-full w-full"
            >
              {/* <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              /> */}
              <LocationPicker onLocationSelect={handleMapLocationSelect} />
            </MapContainer>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Click on the map to select a location
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Form;