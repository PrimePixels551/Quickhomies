
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Trash2, Eye, X, CheckCircle, Clock, XCircle } from 'lucide-react';

const BookingsPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await adminAPI.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await adminAPI.updateOrderStatus(id, status);
            setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
        } catch (error) {
            console.error('Status update failed:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) {
            return;
        }
        try {
            await adminAPI.deleteOrder(id);
            setOrders(orders.filter(o => o._id !== id));
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete booking');
        }
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        accepted: orders.filter(o => o.status === 'Accepted').length,
        paymentPending: orders.filter(o => o.status === 'PaymentPending').length,
        completed: orders.filter(o => o.status === 'Completed').length,
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:border-indigo-300" onClick={() => setFilter('all')}>
                    <p className="text-gray-500 text-sm">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-200 cursor-pointer hover:border-yellow-400" onClick={() => setFilter('Pending')}>
                    <p className="text-yellow-600 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200 cursor-pointer hover:border-blue-400" onClick={() => setFilter('Accepted')}>
                    <p className="text-blue-600 text-sm">Accepted</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.accepted}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 shadow-sm border border-orange-200 cursor-pointer hover:border-orange-400" onClick={() => setFilter('PaymentPending')}>
                    <p className="text-orange-600 text-sm">Payment Pending</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.paymentPending}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200 cursor-pointer hover:border-green-400" onClick={() => setFilter('Completed')}>
                    <p className="text-green-600 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {filter === 'all' ? 'All Bookings' : `${filter} Bookings`} ({filteredOrders.length})
                    </h2>
                    <div className="flex gap-2">
                        {filter !== 'all' && (
                            <button onClick={() => setFilter('all')} className="text-gray-500 hover:text-gray-700 text-sm">
                                Clear Filter
                            </button>
                        )}
                        <button onClick={fetchOrders} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            Refresh
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Provider</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.slice().reverse().map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">...{order._id.slice(-6)}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.customer?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-gray-600">{order.professional?.name || 'Unassigned'}</td>
                                    <td className="px-6 py-4 text-gray-600">{order.serviceName}</td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">₹{order.price || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'PaymentPending' ? 'bg-orange-100 text-orange-800' :
                                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status === 'PaymentPending' ? 'Payment Pending' : order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {order.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, 'Accepted')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Accept"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {order.status === 'PaymentPending' && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm(`Approve payment of ₹${order.price} for this order?`)) {
                                                            handleStatusUpdate(order._id, 'Completed');
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1"
                                                    title="Approve Payment"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Approve ₹{order.price}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(order._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No bookings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Booking Details</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    selectedOrder.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                                        selectedOrder.status === 'PaymentPending' ? 'bg-orange-100 text-orange-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {selectedOrder.status === 'PaymentPending' ? 'Payment Pending' : selectedOrder.status}
                                </span>
                                <span className="text-2xl font-bold text-indigo-600">₹{selectedOrder.price || 0}</span>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-700 mb-2">Service</h4>
                                <p className="text-lg font-medium">{selectedOrder.serviceName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Customer</h4>
                                    <p className="font-medium">{selectedOrder.customer?.name || 'Unknown'}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.customer?.phone || 'No phone'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Provider</h4>
                                    <p className="font-medium">{selectedOrder.professional?.name || 'Unassigned'}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.professional?.phone || 'No phone'}</p>
                                </div>
                            </div>

                            {selectedOrder.customer?.address && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-700 mb-1">📍 Service Address</h4>
                                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">{selectedOrder.customer.address}</p>
                                </div>
                            )}

                            {selectedOrder.description && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedOrder.description}</p>
                                </div>
                            )}

                            <div className="border-t pt-4 text-sm text-gray-500">
                                <p>Created: {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
                            </div>

                            {/* Approve Payment Section for PaymentPending */}
                            {selectedOrder.status === 'PaymentPending' && (
                                <div className="border-t pt-4">
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-orange-800 mb-2">Payment Approval Required</h4>
                                        <p className="text-sm text-orange-700 mb-4">
                                            The partner has collected ₹{selectedOrder.price} from the customer.
                                            Please verify and approve this payment to complete the order.
                                        </p>
                                        <button
                                            onClick={() => {
                                                handleStatusUpdate(selectedOrder._id, 'Completed');
                                                setSelectedOrder(null);
                                            }}
                                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve Payment & Complete Order
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
