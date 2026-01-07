
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Check, X, Eye, Trash2, Edit2 } from 'lucide-react';

const ProfessionalsPage = () => {
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPro, setSelectedPro] = useState(null);
    const [editingPro, setEditingPro] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '', email: '', phone: '', address: '',
        serviceCategory: '', experience: ''
    });

    useEffect(() => {
        fetchPros();
    }, []);

    const fetchPros = async () => {
        try {
            const { data } = await adminAPI.getProfessionals();
            setPros(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await adminAPI.updateUserStatus(id, status);
            fetchPros();
        } catch (error) {
            console.error('Error updating status', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this professional? This cannot be undone.')) {
            return;
        }
        try {
            await adminAPI.deleteUser(id);
            setPros(pros.filter(p => p._id !== id));
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete professional');
        }
    };

    const openEditModal = (pro) => {
        setEditingPro(pro);
        setEditForm({
            name: pro.name || '',
            email: pro.email || '',
            phone: pro.phone || '',
            address: pro.address || '',
            serviceCategory: pro.serviceCategory || '',
            experience: pro.experience || '',
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await adminAPI.updateUser(editingPro._id, {
                ...editForm,
                experience: Number(editForm.experience) || 0,
            });
            setPros(pros.map(p => p._id === editingPro._id ? data : p));
            setEditingPro(null);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update professional');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Service Providers ({pros.length})</h2>
                <button onClick={fetchPros} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Refresh
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Experience</th>
                            <th className="px-6 py-4">Rating</th>
                            <th className="px-6 py-4">Verification</th>
                            <th className="px-6 py-4">Availability</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pros.map((pro) => (
                            <tr key={pro._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                                            {pro.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{pro.name}</p>
                                            <p className="text-xs text-gray-500">{pro.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium">{pro.serviceCategory || 'N/A'}</td>
                                <td className="px-6 py-4 text-gray-600">{pro.experience ? `${pro.experience} Years` : '-'}</td>
                                <td className="px-6 py-4 text-yellow-500 font-bold">{pro.rating || 'New'} {pro.rating > 0 && '⭐'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase ${pro.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                        pro.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {pro.verificationStatus || 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pro.isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {pro.isAvailable ? 'Online' : 'Offline'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            onClick={() => setSelectedPro(pro)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(pro)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {pro.verificationStatus !== 'verified' && (
                                            <button
                                                onClick={() => handleStatusUpdate(pro._id, 'verified')}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        {pro.verificationStatus !== 'rejected' && pro.verificationStatus !== 'verified' && (
                                            <button
                                                onClick={() => handleStatusUpdate(pro._id, 'rejected')}
                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="Reject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(pro._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pros.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No professionals found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Professional Details Modal */}
            {selectedPro && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Professional Details</h3>
                            <button onClick={() => setSelectedPro(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                                    {selectedPro.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{selectedPro.name}</p>
                                    <p className="text-sm text-indigo-600">{selectedPro.serviceCategory}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 border-t pt-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Rating</p>
                                    <p className="font-bold text-yellow-500">{selectedPro.rating || 'New'} ⭐</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Reviews</p>
                                    <p className="font-bold">{selectedPro.reviewCount || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Experience</p>
                                    <p className="font-bold">{selectedPro.experience || 0} Years</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Jobs</p>
                                    <p className="font-bold">{selectedPro.jobsCompleted || 0}</p>
                                </div>
                            </div>
                            <div className="border-t pt-3">
                                <p className="text-sm"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedPro.email}</span></p>
                                <p className="text-sm mt-2"><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedPro.phone || 'Not provided'}</span></p>
                                <p className="text-sm mt-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{selectedPro.address || 'Not provided'}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Professional Modal */}
            {editingPro && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Edit Professional</h3>
                            <button onClick={() => setEditingPro(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editForm.serviceCategory}
                                    onChange={(e) => setEditForm({ ...editForm, serviceCategory: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={editForm.experience}
                                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingPro(null)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalsPage;
