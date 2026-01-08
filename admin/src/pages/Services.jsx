import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, X, Wrench, Edit2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: '', minPrice: '', maxPrice: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/services`);
            setServices(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch services');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await axios.delete(`${API_URL}/services/${id}`);
                setServices(services.filter((service) => service._id !== id));
            } catch (err) {
                alert('Failed to delete service');
            }
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            icon: service.icon,
            minPrice: service.minPrice || '',
            maxPrice: service.maxPrice || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                minPrice: Number(formData.minPrice) || 0,
                maxPrice: Number(formData.maxPrice) || 0
            };

            if (editingService) {
                const { data } = await axios.put(`${API_URL}/services/${editingService._id}`, payload);
                setServices(services.map(s => s._id === editingService._id ? data : s));
            } else {
                const { data } = await axios.post(`${API_URL}/services`, payload);
                setServices([...services, data]);
            }
            closeModal();
        } catch (err) {
            alert('Failed to save service');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
        setFormData({ name: '', icon: '', minPrice: '', maxPrice: '' });
    };

    const openAddModal = () => {
        setEditingService(null);
        setFormData({ name: '', icon: '', minPrice: '', maxPrice: '' });
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Wrench className="w-6 h-6" />
                    Services Management
                </h2>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-[#001F54] text-white px-4 py-2 rounded-lg hover:bg-[#003080] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Service
                </button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {services.map((service) => (
                                <tr key={service._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{service.icon}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{service.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-green-600 font-semibold">
                                            ₹{service.minPrice || 0} - ₹{service.maxPrice || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(service.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#001F54]"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Icon Name (Ionicons)
                                </label>
                                <div className="text-xs text-gray-500 mb-1">
                                    Use icon names like 'flash-outline', 'water-outline'.
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#001F54]"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#001F54]"
                                        value={formData.minPrice}
                                        onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                                        placeholder="e.g., 100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#001F54]"
                                        value={formData.maxPrice}
                                        onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                                        placeholder="e.g., 2000"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#001F54] text-white rounded-lg hover:bg-[#003080]"
                                >
                                    {editingService ? 'Update Service' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;

