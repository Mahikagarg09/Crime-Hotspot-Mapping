import  { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebase/firebase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const Stats = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const getCrimeTypeData = () => {
    const crimeCount = {};
    reports.forEach(report => {
      if (report.crime) {
        crimeCount[report.crime] = (crimeCount[report.crime] || 0) + 1;
      }
    });
    return Object.entries(crimeCount).map(([name, value]) => ({ name, value }));
  };

  const getYearlyData = () => {
    const yearlyCount = {};
    reports.forEach(report => {
      if (report.created_at) {
        const year = new Date(report.created_at).getFullYear();
        yearlyCount[year] = (yearlyCount[year] || 0) + 1;
      }
    });
    return Object.entries(yearlyCount)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);
  };

  const getYearlyCrimeTypeData = () => {
    const yearlyData = {};
    reports.forEach(report => {
      if (report.created_at && report.crime) {
        const year = new Date(report.created_at).getFullYear();
        if (!yearlyData[year]) {
          yearlyData[year] = {};
        }
        yearlyData[year][report.crime] = (yearlyData[year][report.crime] || 0) + 1;
      }
    });

    return Object.entries(yearlyData).map(([year, crimes]) => ({
      year,
      ...crimes
    })).sort((a, b) => a.year - b.year);
  };

  if (loading) return <div className="p-4">Loading statistics...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <>
    <div className="p-4 max-w-7xl mx-auto space-y-6">
    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crime Type Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Crime Type Distribution</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCrimeTypeData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCrimeTypeData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Trend */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Yearly Crime Trend</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getYearlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Total Crimes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Crime Type Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Yearly Crime Type Distribution</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getYearlyCrimeTypeData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                {getCrimeTypeData().map((crime, index) => (
                  <Bar 
                    key={crime.name}
                    dataKey={crime.name}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Reports</h3>
          <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Crime Types</h3>
          <p className="text-3xl font-bold text-green-600">{getCrimeTypeData().length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Years Covered</h3>
          <p className="text-3xl font-bold text-purple-600">{getYearlyData().length}</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Stats;