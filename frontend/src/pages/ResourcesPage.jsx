import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { resourceAPI } from '../services/api';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    resourceName: '',
    totalQuantity: '',
    ward: 'General',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await resourceAPI.getAll();
      setResources(res.data);
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      await resourceAPI.create(formData);
      setFormData({
        resourceName: '',
        totalQuantity: '',
        ward: 'General',
      });
      setShowForm(false);
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add resource');
    }
  };

  const handleUseResource = async (resourceId, quantity) => {
    try {
      await resourceAPI.updateQuantity(resourceId, {
        quantityUsed: parseInt(quantity),
      });
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update resource');
    }
  };

  const handleRestock = async (resourceId, quantity) => {
    try {
      await resourceAPI.restock(resourceId, {
        quantityAdded: parseInt(quantity),
      });
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restock');
    }
  };

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
                Resource Management
              </h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus size={20} />
                <span>Add Resource</span>
              </button>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                onClose={() => setError('')}
              />
            )}

            {/* Add Resource Form */}
            {showForm && (
              <Card className="mb-8" title="Add New Resource">
                <form onSubmit={handleAddResource} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={formData.resourceName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resourceName: e.target.value,
                        })
                      }
                      className="px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Resource</option>
                      <option value="ICU_Beds">ICU Beds</option>
                      <option value="Ventilators">Ventilators</option>
                      <option value="Oxygen_Cylinders">Oxygen Cylinders</option>
                      <option value="Monitors">Monitors</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Total Quantity"
                      value={formData.totalQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalQuantity: e.target.value,
                        })
                      }
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                    <select
                      value={formData.ward}
                      onChange={(e) =>
                        setFormData({...formData, ward: e.target.value})
                      }
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="ICU">ICU</option>
                      <option value="General">General Ward</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Add Resource
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

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource) => (
                <Card key={resource._id}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">
                          {resource.resourceName.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-gray-600">{resource.ward}</p>
                      </div>
                      {resource.isLowStock && (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                          ⚠️ Low Stock
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold">
                          Available: {resource.availableQuantity}
                        </span>
                        <span className="text-sm text-gray-600">
                          Total: {resource.totalQuantity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition ${
                            resource.availableQuantity / resource.totalQuantity >
                            0.5
                              ? 'bg-green-500'
                              : resource.availableQuantity /
                                  resource.totalQuantity >
                                0.2
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${
                              (resource.availableQuantity /
                                resource.totalQuantity) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2 border-t">
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        id={`use-${resource._id}`}
                      />
                      <button
                        onClick={() => {
                          const qty = document.getElementById(
                            `use-${resource._id}`
                          ).value;
                          if (qty) handleUseResource(resource._id, qty);
                        }}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => {
                          const qty = document.getElementById(
                            `use-${resource._id}`
                          ).value;
                          if (qty) handleRestock(resource._id, qty);
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm flex items-center justify-center space-x-1"
                      >
                        <RotateCcw size={14} />
                        <span>Restock</span>
                      </button>
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
