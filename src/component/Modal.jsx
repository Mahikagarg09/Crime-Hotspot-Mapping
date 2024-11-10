import GeocodingMap from './GeocodingMap.jsx'

// Modal Component
const Modal = ({ setFormData,isOpen, onClose, setSelectedLocation }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl relative pt-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <GeocodingMap setFormData={setFormData} setSelectedLocation={setSelectedLocation} onClose={onClose} />
      </div>
    </div>
  );
};


export default Modal;