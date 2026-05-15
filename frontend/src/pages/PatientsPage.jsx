import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { Plus, Edit, Trash2, Activity, Filter } from 'lucide-react';
import { patientAPI, aiAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    phone: '',
    disease: '',
    medicalHistory: '',
    emergencyContact: { name: '', phone: '', relation: '' },
  });
  const [riskFormData, setRiskFormData] = useState({
    heart_rate: '',
    systolic_bp: '',
    diastolic_bp: '',
    spo2: '',
    fever: false,
    cough: false,
    breathing_difficulty: false,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [highRiskOnly]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getAll(
        highRiskOnly ? { riskLevel: 'High' } : {}
      );
      setPatients(res.data);
    } catch (err) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await patientAPI.update(editingId, formData);
        setError('');
        setEditingId(null);
      } else {
        await patientAPI.create(formData);
      }
      setFormData({
        name: '',
        age: '',
        gender: 'male',
        phone: '',
        disease: '',
        medicalHistory: '',
        emergencyContact: { name: '', phone: '', relation: '' },
      });
      setShowForm(false);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await patientAPI.delete(id);
        fetchPatients();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const openRiskForm = (patient) => {
    setSelectedPatient(patient);
    setRiskFormData({
      heart_rate: patient.riskPrediction?.healthMetrics?.heartRate || '',
      systolic_bp: patient.riskPrediction?.healthMetrics?.systolicBp || '',
      diastolic_bp: patient.riskPrediction?.healthMetrics?.diastolicBp || '',
      spo2: patient.riskPrediction?.healthMetrics?.spo2 || '',
      fever: Boolean(patient.riskPrediction?.healthMetrics?.fever),
      cough: Boolean(patient.riskPrediction?.healthMetrics?.cough),
      breathing_difficulty: Boolean(
        patient.riskPrediction?.healthMetrics?.breathingDifficulty
      ),
    });
    setShowRiskForm(true);
  };

  const handleRiskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setRiskLoading(true);
    setError('');
    try {
      await aiAPI.predictRisk({
        patientId: selectedPatient._id,
        healthMetrics: {
          age: Number(selectedPatient.age),
          heart_rate: Number(riskFormData.heart_rate),
          systolic_bp: Number(riskFormData.systolic_bp),
          diastolic_bp: Number(riskFormData.diastolic_bp),
          spo2: Number(riskFormData.spo2),
          fever: riskFormData.fever ? 1 : 0,
          cough: riskFormData.cough ? 1 : 0,
          breathing_difficulty: riskFormData.breathing_difficulty ? 1 : 0,
        },
      });
      setShowRiskForm(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.error || 'Risk prediction failed');
    } finally {
      setRiskLoading(false);
    }
  };

  const riskBadgeClass = (riskLabel) => {
    if (riskLabel === 'High') return 'bg-red-100 text-red-800';
    if (riskLabel === 'Medium') return 'bg-yellow-100 text-yellow-800';
    if (riskLabel === 'Low') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-700';
  };

  const displayedPatients = patients;

  if (loading) return <Loader />;

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
                Patient Management
              </h1>
              {(user?.role === 'doctor' || user?.role === 'admin') && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setHighRiskOnly(!highRiskOnly)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      highRiskOnly
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    <Filter size={20} />
                    <span>High Risk</span>
                  </button>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Plus size={20} />
                    <span>Add Patient</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                onClose={() => setError('')}
              />
            )}

            {showRiskForm && selectedPatient && (
              <Card className="mb-8" title={`Predict Risk: ${selectedPatient.name}`}>
                <form onSubmit={handleRiskSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="number"
                      placeholder="Heart Rate"
                      value={riskFormData.heart_rate}
                      onChange={(e) =>
                        setRiskFormData({
                          ...riskFormData,
                          heart_rate: e.target.value,
                        })
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Systolic BP"
                      value={riskFormData.systolic_bp}
                      onChange={(e) =>
                        setRiskFormData({
                          ...riskFormData,
                          systolic_bp: e.target.value,
                        })
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Diastolic BP"
                      value={riskFormData.diastolic_bp}
                      onChange={(e) =>
                        setRiskFormData({
                          ...riskFormData,
                          diastolic_bp: e.target.value,
                        })
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="SpO2"
                      value={riskFormData.spo2}
                      onChange={(e) =>
                        setRiskFormData({...riskFormData, spo2: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {[
                      ['fever', 'Fever'],
                      ['cough', 'Cough'],
                      ['breathing_difficulty', 'Breathing difficulty'],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={riskFormData[key]}
                          onChange={(e) =>
                            setRiskFormData({
                              ...riskFormData,
                              [key]: e.target.checked,
                            })
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={riskLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition"
                    >
                      {riskLoading ? 'Predicting...' : 'Predict Risk'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRiskForm(false);
                        setSelectedPatient(null);
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {/* Form */}
            {showForm && (
              <Card className="mb-8" title="Add New Patient">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Patient Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({...formData, name: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({...formData, age: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({...formData, gender: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({...formData, phone: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Disease/Condition"
                      value={formData.disease}
                      onChange={(e) =>
                        setFormData({...formData, disease: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Medical History"
                      value={formData.medicalHistory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalHistory: e.target.value,
                        })
                      }
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Contact Name"
                        value={formData.emergencyContact.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              name: e.target.value,
                            },
                          })
                        }
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="tel"
                        placeholder="Contact Phone"
                        value={formData.emergencyContact.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Relation"
                        value={formData.emergencyContact.relation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: {
                              ...formData.emergencyContact,
                              relation: e.target.value,
                            },
                          })
                        }
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                    >
                      {editingId ? 'Update' : 'Add'} Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {/* Patients Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">Age</th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Disease
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Bed
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Risk
                      </th>
                      <th className="text-center py-3 px-4 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedPatients.map((patient) => (
                      <tr key={patient._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{patient.name}</td>
                        <td className="py-3 px-4">{patient.age}</td>
                        <td className="py-3 px-4">{patient.disease}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              patient.status === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : patient.status === 'admitted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {patient.bedId?.bedNumber || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${riskBadgeClass(
                              patient.riskLevel || patient.riskPrediction?.riskLabel
                            )}`}
                          >
                            {patient.riskLevel ||
                              patient.riskPrediction?.riskLabel ||
                              'Not predicted'}
                          </span>
                          {patient.riskPrediction?.probability && (
                            <p className="text-xs text-gray-500 mt-1">
                              {(patient.riskPrediction.probability * 100).toFixed(0)}%
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button
                            onClick={() => openRiskForm(patient)}
                            className="inline-block text-green-600 hover:text-green-800"
                            title="Predict Risk"
                          >
                            <Activity size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setFormData(patient);
                              setEditingId(patient._id);
                              setShowForm(true);
                            }}
                            className="inline-block text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(patient._id)}
                            className="inline-block text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
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
