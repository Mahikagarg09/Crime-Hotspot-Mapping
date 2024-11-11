import { useState, useEffect } from "react";
import crimeType from "../constants/crimeType";
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

    if (loading) return <div className="m-5">Loading..</div>;
    if (error) return <div>Error: {error.message}</div>;


    const filteredReports = selectedCrimeType === 'all'
        ? reports
        : reports.filter(report => report.crime === selectedCrimeType);

    return (
        <div className="p-4 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div className=" mb-6 shadow-sm border border-gray-200">
                <div className="bg-white p-4 rounded-lg">
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Crime Type
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
                            <button
                                onClick={() => setSelectedCrimeType('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors
              ${selectedCrimeType === 'all'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                                All Crimes
                            </button>

                            {crimeType.map((crime) => (
                                <button
                                    key={crime}
                                    onClick={() => setSelectedCrimeType(crime)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors
                ${selectedCrimeType === crime
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    {crime}
                                </button>
                            ))}
                        </div>
                    </div>
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
                            const reportDate = new Date(report.created_at);
                            const formattedDate = reportDate.toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric',
                                hour12: true
                            });

                            return (
                                <Marker
                                    position={coordinates}
                                    icon={icon}
                                    key={key}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-extrabold text-gray-900 mb-2">{report.crime}</h3>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p><span className="font-bold">Description:</span> {report.crimeDescription}</p>
                                                <p><span className="font-bold">Location:</span> {report.location.address}</p>
                                                <p><span className="font-bold">Date:</span> {formattedDate}</p>
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
