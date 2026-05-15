import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { CalendarDays, Clock, Plus, Stethoscope } from 'lucide-react';
import { authAPI, scheduleAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function SchedulePage() {
  const { user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    startTime: '',
    endTime: '',
    shift: 'morning',
  });

  useEffect(() => {
    if (user) fetchPageData();
  }, [user]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError('');

      if (user.role === 'admin') {
        const [schedulesRes, doctorsRes] = await Promise.all([
          scheduleAPI.getAll({}),
          authAPI.getUsers('doctor'),
        ]);
        setSchedules(schedulesRes.data);
        setDoctors(doctorsRes.data);
        return;
      }

      if (user.role === 'doctor') {
        const schedulesRes = await scheduleAPI.getByDoctor(user.id);
        setSchedules(schedulesRes.data);
        return;
      }

      const schedulesRes = await scheduleAPI.getAll({});
      setSchedules(schedulesRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load schedules.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await scheduleAPI.create(formData);
      setFormData({
        doctorId: '',
        date: '',
        startTime: '',
        endTime: '',
        shift: 'morning',
      });
      setShowForm(false);
      fetchPageData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add schedule');
    }
  };

  if (loading) return <Loader />;

  const isAdmin = user?.role === 'admin';

  const getShiftColor = (shift) => {
    switch (shift) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-800';
      case 'afternoon':
        return 'bg-blue-100 text-blue-800';
      case 'night':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-4 lg:p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Doctor Schedules
              </h1>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <Plus size={20} />
                  <span>Add Schedule</span>
                </button>
              )}
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                onClose={() => setError('')}
              />
            )}

            {isAdmin && showForm && (
              <Card className="mb-8" title="Add New Schedule">
                <form onSubmit={handleAddSchedule} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Stethoscope
                        className="absolute left-3 top-3 text-gray-400"
                        size={20}
                      />
                      <select
                        value={formData.doctorId}
                        onChange={(e) =>
                          setFormData({...formData, doctorId: e.target.value})
                        }
                        className="w-full px-10 py-2 border rounded-lg bg-white"
                        required
                      >
                        <option value="">Select doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name}
                            {doctor.department ? ` - ${doctor.department}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <CalendarDays
                        className="absolute left-3 top-3 text-gray-400"
                        size={20}
                      />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({...formData, date: e.target.value})
                        }
                        className="w-full px-10 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-3 text-gray-400"
                        size={20}
                      />
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({...formData, startTime: e.target.value})
                        }
                        className="w-full px-10 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-3 text-gray-400"
                        size={20}
                      />
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({...formData, endTime: e.target.value})
                        }
                        className="w-full px-10 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <select
                      value={formData.shift}
                      onChange={(e) =>
                        setFormData({...formData, shift: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg md:col-span-2"
                    >
                      <option value="morning">Morning (8AM-2PM)</option>
                      <option value="afternoon">Afternoon (2PM-8PM)</option>
                      <option value="night">Night (8PM-8AM)</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Add Schedule
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schedules.map((schedule) => (
                <Card key={schedule._id}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">
                          {schedule.doctorId?.name || 'Unknown Doctor'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {schedule.doctorId?.department || 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm capitalize ${getShiftColor(
                          schedule.shift
                        )}`}
                      >
                        {schedule.shift}
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-sm">
                        Date: {new Date(schedule.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        Time: {schedule.startTime} - {schedule.endTime}
                      </p>
                      <p className="text-sm mt-2">
                        Patients: {schedule.patientsAssigned?.length || 0}
                      </p>
                    </div>

                    <div className="border-t pt-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                          schedule.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : schedule.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
