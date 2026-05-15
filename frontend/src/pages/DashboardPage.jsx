import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { Users, Bed, TrendingUp, ShieldAlert } from 'lucide-react';
import { patientAPI, bedAPI, resourceAPI, aiAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch patient count
      const patientsRes = await patientAPI.getAll();
      const totalPatients = patientsRes.data.length;
      const admittedPatients = patientsRes.data.filter(
        (p) => p.status === 'admitted'
      ).length;

      // Fetch bed stats
      const bedStatsRes = await bedAPI.getStats();

      // Fetch resource stats
      const resourceStatsRes = await resourceAPI.getStats();
      const lowStockResources = resourceStatsRes.data.filter(
        (r) => r.isLowStock
      );

      let aiStats = {
        highRiskPatients: 0,
        mediumRiskPatients: 0,
        lowRiskPatients: 0,
        predictionCoverage: 0,
      };
      try {
        const aiStatsRes = await aiAPI.getDashboardStats();
        aiStats = aiStatsRes.data;
      } catch (aiErr) {
        console.warn('AI stats unavailable', aiErr);
      }

      setStats({
        totalPatients,
        admittedPatients,
        ...bedStatsRes.data,
        lowStockResources: lowStockResources.length,
        ...aiStats,
      });

      // Build alerts
      const newAlerts = [];
      if (bedStatsRes.data.icuOccupancyPercentage >= 80) {
        newAlerts.push({
          type: 'warning',
          message: `⚠️ ICU Occupancy is ${bedStatsRes.data.icuOccupancyPercentage}%`,
        });
      }
      if (lowStockResources.length > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${lowStockResources.length} resources are running low`,
        });
      }
      if (aiStats.highRiskPatients > 2) {
        newAlerts.push({
          type: 'error',
          message: `${aiStats.highRiskPatients} high risk patients need attention`,
        });
      }
      setAlerts(newAlerts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="mb-8 space-y-3">
                {alerts.map((alert, idx) => (
                  <Alert
                    key={idx}
                    message={alert.message}
                    type={alert.type}
                  />
                ))}
              </div>
            )}

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Patients */}
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Patients</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.totalPatients}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {stats.admittedPatients} admitted
                      </p>
                    </div>
                    <Users size={40} className="text-blue-300" />
                  </div>
                </Card>

                {/* Available Beds */}
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Available Beds</p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats.freeBeds}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {stats.totalBeds} total
                      </p>
                    </div>
                    <Bed size={40} className="text-green-300" />
                  </div>
                </Card>

                {/* ICU Occupancy */}
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">ICU Occupancy</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {stats.icuOccupancyPercentage}%
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        High if {'>'} 80%
                      </p>
                    </div>
                    <TrendingUp size={40} className="text-orange-300" />
                  </div>
                </Card>

                {/* High Risk Patients */}
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">High Risk Patients</p>
                      <p className="text-3xl font-bold text-red-600">
                        {stats.highRiskPatients}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {Math.round(stats.predictionCoverage)}% predicted
                      </p>
                    </div>
                    <ShieldAlert size={40} className="text-red-300" />
                  </div>
                </Card>
              </div>
            )}

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <p className="text-gray-600 text-sm">Medium Risk</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.mediumRiskPatients}
                  </p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm">Low Risk</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.lowRiskPatients}
                  </p>
                </Card>
                <Card>
                  <p className="text-gray-600 text-sm">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.lowStockResources}
                  </p>
                </Card>
              </div>
            )}

            {/* Quick Links */}
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/patients"
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  <p className="font-semibold text-blue-700">Manage Patients</p>
                  <p className="text-sm text-gray-600">Add/Edit patient info</p>
                </a>
                <a
                  href="/beds"
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
                >
                  <p className="font-semibold text-green-700">Manage Beds</p>
                  <p className="text-sm text-gray-600">
                    Track bed allocation
                  </p>
                </a>
                <a
                  href="/schedule"
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                >
                  <p className="font-semibold text-purple-700">
                    Doctor Schedule
                  </p>
                  <p className="text-sm text-gray-600">View/Manage shifts</p>
                </a>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
