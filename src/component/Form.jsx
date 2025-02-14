import { database } from "../firebase/firebase"; 
import { ref, set } from "firebase/database";
import { useState } from "react";
import Modal from "./Modal";
import Navbar from './Navbar';

const Form = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [formData, setFormData] = useState({
    crime: "",
    location: {
      address: "",
      coordinates: []
    },
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

  // ... Rest of the validation and form submission logic remains the same ...
  const validateForm = () => {
    if (!formData.crime) return "Please select a crime type";
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
        created_at: new Date().toISOString()
      });
     
      setSubmitSuccess(true);
      console.log(formData);
      
      setSubmitSuccess(true);
      setFormData({
        crime: "",
        location: {
          address: "",
          coordinates: []
        },
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
    <>
    <Navbar/>
    <h1 className='text-center text-3xl font-bold mt-8'>File an FIR</h1>
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-4 mb-4">
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
              value={formData.crime}
              onChange={(e) => handleInputChange("crime", e.target.value)}
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
                value={selectedLocation ? selectedLocation.address : ""}
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
      <Modal setFormData={setFormData} setSelectedLocation={setSelectedLocation} isOpen={isMapOpen} onClose={() => setIsMapOpen(false)}/>
    </div>
    </>
  );
};

export default Form;