import { useState } from "react";
import DefaultPage from "./component/DefaultPage";
import Navbar from "./component/Navbar";
import Stats from "./component/Stats";

const App = () => {
  const [activeTab, setActiveTab] = useState("map");

  return (
    <>
      <Navbar />
      <div className="p-4 max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center sm:space-x-4">
          <div>
            <h1 className="text-3xl mt-4 font-bold text-gray-900">Crime Hotspot Analysis - India</h1>
            <p className="text-gray-600 mt-2">{activeTab== "map" ?"Interactive visualization of crime data across India" : "Crime Statistics Dashboard"} </p>
          </div>
          {/* Navigation Tabs */}
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <button
              className={`px-4 py-2 font-medium  rounded-md ${activeTab === "map"
                ? "text-white border-b-2 bg-blue-600"
                : "bg-gray-400"
                }`}
              onClick={() => setActiveTab("map")}
            >
              Map
            </button>
            <button
              className={`px-4 py-2 font-medium  rounded-md ${activeTab === "stats"
                ? "text-white border-b-2 bg-blue-600"
                : "bg-gray-400"
                }`}
              onClick={() => setActiveTab("stats")}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4">
          {activeTab === "map" ? <DefaultPage /> : <Stats />}
        </div>
      </div>
    </>
  );
};

export default App;
