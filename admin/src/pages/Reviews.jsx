import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/reviews`);
            setReviews(data);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review? This will recalculate the professional\'s rating.')) {
            return;
        }
        try {
            await axios.delete(`${API_URL}/reviews/${id}`);
            setReviews(reviews.filter(r => r._id !== id));
        } catch (error) {
            console.error('Failed to delete review', error);
            alert('Failed to delete review');
        }
    };

    const filteredReviews = filter === 'all'
        ? reviews
        : reviews.filter(r => r.rating === parseInt(filter));

    const getStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const stats = {
        total: reviews.length,
        average: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0,
        five: reviews.filter(r => r.rating === 5).length,
        four: reviews.filter(r => r.rating === 4).length,
        three: reviews.filter(r => r.rating === 3).length,
        two: reviews.filter(r => r.rating === 2).length,
        one: reviews.filter(r => r.rating === 1).length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Reviews Management</h1>
                <button
                    onClick={fetchReviews}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-gray-500 text-sm">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-gray-500 text-sm">Average Rating</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.average} ★</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200 cursor-pointer hover:bg-green-100" onClick={() => setFilter('5')}>
                    <p className="text-green-600 text-sm">5 Stars</p>
                    <p className="text-xl font-bold text-green-700">{stats.five}</p>
                </div>
                <div className="bg-lime-50 rounded-xl p-4 shadow-sm border border-lime-200 cursor-pointer hover:bg-lime-100" onClick={() => setFilter('4')}>
                    <p className="text-lime-600 text-sm">4 Stars</p>
                    <p className="text-xl font-bold text-lime-700">{stats.four}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-200 cursor-pointer hover:bg-yellow-100" onClick={() => setFilter('3')}>
                    <p className="text-yellow-600 text-sm">3 Stars</p>
                    <p className="text-xl font-bold text-yellow-700">{stats.three}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 shadow-sm border border-orange-200 cursor-pointer hover:bg-orange-100" onClick={() => setFilter('2')}>
                    <p className="text-orange-600 text-sm">2 Stars</p>
                    <p className="text-xl font-bold text-orange-700">{stats.two}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-200 cursor-pointer hover:bg-red-100" onClick={() => setFilter('1')}>
                    <p className="text-red-600 text-sm">1 Star</p>
                    <p className="text-xl font-bold text-red-700">{stats.one}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    All Reviews
                </button>
                {[5, 4, 3, 2, 1].map(star => (
                    <button
                        key={star}
                        onClick={() => setFilter(String(star))}
                        className={`px-4 py-2 rounded-lg ${filter === String(star) ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {star} ★
                    </button>
                ))}
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Professional</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReviews.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    No reviews found
                                </td>
                            </tr>
                        ) : (
                            filteredReviews.map((review) => (
                                <tr key={review._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="font-medium text-gray-900">{review.customer?.name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{review.customer?.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="font-medium text-gray-900">{review.professional?.name || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{review.professional?.serviceCategory}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {review.order?.serviceName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-yellow-500 text-lg">{getStars(review.rating)}</span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-sm text-gray-700 truncate" title={review.comment}>
                                            {review.comment || <span className="text-gray-400 italic">No comment</span>}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="Delete Review"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reviews;
