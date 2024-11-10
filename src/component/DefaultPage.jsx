import { useState, useEffect } from "react";
import "../../node_modules/leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { ref, get } from 'firebase/database';
import { database } from '../firebase/firebase';
import { FaTheaterMasks, FaFistRaised, FaHammer, FaMoneyBillAlt, FaExclamationTriangle, FaDoorOpen, FaQuestionCircle } from "react-icons/fa";
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';


function createIcon(icon) {
    return L.divIcon({
        className: 'custom-icon',
        html: ReactDOMServer.renderToString(icon), 
        iconSize: [24, 24],
        iconAnchor: [16, 32],
    });
}

// Map crime types to react-icons
const crimeTypeIcons = {
    "Theft": <FaTheaterMasks size={32} />,
    "Assault": <FaFistRaised size={32} />,
    "Vandalism": <FaHammer size={32} />,
    "Fraud": <FaMoneyBillAlt size={32} />,
    "Harassment": <FaExclamationTriangle size={32} />,
    "Breaking and Entering": <FaDoorOpen size={32} />,
    "Other": <FaQuestionCircle size={32} />
};

export default function Map() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCrimeType, setSelectedCrimeType] = useState('all');

    const center = [28.6139, 77.2090];

    useEffect(() => {
        const reportsRef = ref(database, 'reports');

        get(reportsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const reportsArray = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));
                    setReports(reportsArray);
                    console.log(reports)
                } else {
                    console.log('No data available');
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading map...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const formatDateFromId = (id) => {
        const timestamp = parseInt(id, 10); 
        const date = new Date(timestamp); 
        return date.toLocaleString(); 
    };

    const filteredReports = selectedCrimeType === 'all'
    ? reports
    : reports.filter(report => report.crime === selectedCrimeType);

    return (
        <div className="p-4 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Crime Hotspot Analysis - India</h1>
                <p className="text-gray-600 mt-2">Interactive visualization of crime data across India</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Crime Type Filter */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Crime Type
                    </label>
                    <select
                        value={selectedCrimeType}
                        onChange={(e) => setSelectedCrimeType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                         <option value="all">All Crimes</option>
                        <option value="Theft">Theft</option>
                        <option value="Assault">Assault</option>
                        <option value="Vandalism">Vandalism</option>
                        <option value="Fraud">Fraud</option>
                        <option value="Harassment">Harassment</option>
                        <option value="Breaking and Entering">Breaking and Entering</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-center  rounded-lg shadow-sm border border-gray-200">
                <MapContainer
                    center={center}
                    zoom={8}
                    style={{ height: "80vh", width: "100%", zIndex: "0" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredReports.map((report, key) => {
                        const coordinates = report.location.coordinates;
                        if (coordinates && coordinates.length === 2) {
                            const crimeIcon = crimeTypeIcons[report.crime] || crimeTypeIcons["Other"];
                            const icon = createIcon(crimeIcon);
                            const reportDate = formatDateFromId(report.id);

                            return (
                                <Marker
                                    position={coordinates}
                                    icon={icon}
                                    key={report.id}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-extrabold text-gray-900 mb-2">{report.crime}</h3>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p><span className="font-bold">Description:</span> {report.crimeDescription}</p>
                                                <p><span className="font-bold">Location:</span> {report.location.address}</p>
                                                <p><span className="font-bold">Date:</span> {reportDate}</p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        }
                        return null;
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
