import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { Plus, Trash2 } from 'lucide-react';
import { bedAPI, patientAPI } from '../services/api';

export default function BedsPage() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bedNumber: '',
    wardType: 'General',
    floor: '',
    costPerDay: '',
  });

  useEffect(() => {
    fetchBeds();
    fetchPatients();
  }, []);

  const fetchBeds = async () => {
    try {
      const res = await bedAPI.getAll();
      setBeds(res.data);
    } catch (err) {
      setError('Failed to load beds');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await patientAPI.getAll();
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to load patients');
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    try {
      await bedAPI.create(formData);
      setFormData({
        bedNumber: '',
        wardType: 'General',
        floor: '',
        costPerDay: '',
      });
      setShowForm(false);
      fetchBeds();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bed');
    }
  };

  const handleAssignBed = async (bedId, patientId) => {
    try {
      await bedAPI.assign({ bedId, patientId });
      fetchBeds();
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign bed');
    }
  };

  const handleFreeBed = async (bedId) => {
    try {
      await bedAPI.free({ bedId });
      fetchBeds();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to free bed');
    }
  };

  if (loading) return <Loader />;

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'free':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Bed Management
              </h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus size={20} />
                <span>Add Bed</span>
              </button>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                onClose={() => setError('')}
              />
            )}

            {/* Add Bed Form */}
            {showForm && (
              <Card className="mb-8" title="Add New Bed">
                <form onSubmit={handleAddBed} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Bed Number (e.g., ICU-101)"
                      value={formData.bedNumber}
                      onChange={(e) =>
                        setFormData({...formData, bedNumber: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                    <select
                      value={formData.wardType}
                      onChange={(e) =>
                        setFormData({...formData, wardType: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="ICU">ICU</option>
                      <option value="General">General Ward</option>
                      <option value="Private">Private</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Floor"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({...formData, floor: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Cost per Day"
                      value={formData.costPerDay}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          costPerDay: e.target.value,
                        })
                      }
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Add Bed
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {/* Beds Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Bed Number</th>
                      <th className="text-left py-3 px-4">Ward Type</th>
                      <th className="text-left py-3 px-4">Floor</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Patient</th>
                      <th className="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beds.map((bed) => (
                      <tr key={bed._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-semibold">
                          {bed.bedNumber}
                        </td>
                        <td className="py-3 px-4">{bed.wardType}</td>
                        <td className="py-3 px-4">{bed.floor}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                              bed.status
                            )}`}
                          >
                            {bed.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {bed.patientId?.name || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {bed.status === 'free' ? (
                            <select
                              onChange={(e) =>
                                handleAssignBed(bed._id, e.target.value)
                              }
                              defaultValue=""
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="">Assign Patient</option>
                              {patients
                                .filter((p) => !p.bedId && p.status === 'admitted')
                                .map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.name}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => handleFreeBed(bed._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
