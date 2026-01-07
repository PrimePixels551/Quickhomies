
import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import { adminAPI } from '../services/api';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 font-medium flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {change}
            </span>
            <span className="text-gray-400 ml-2">vs last month</span>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        professionals: 0,
        orders: 0,
        revenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [usersRes, prosRes, ordersRes] = await Promise.all([
                adminAPI.getAllUsers(),
                adminAPI.getProfessionals(),
                adminAPI.getAllOrders(),
            ]);

            const orders = ordersRes.data;
            const revenue = orders.reduce((acc, order) => acc + (order.price || 0), 0);

            setStats({
                users: usersRes.data.length,
                professionals: prosRes.data.length,
                orders: orders.length,
                revenue,
            });
            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    change="+12%"
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Service Providers"
                    value={stats.professionals}
                    change="+8%"
                    icon={Briefcase}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Active Bookings"
                    value={stats.orders}
                    change="+24%"
                    icon={Calendar}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.revenue}`}
                    change="+3.2%"
                    icon={DollarSign}
                    color="bg-green-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Bookings</h3>
                    <div className="space-y-4">
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-500 text-sm">No bookings yet.</p>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                                            {order.customer?.name ? order.customer.name.charAt(0) : 'U'}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{order.customer?.name || 'Unknown User'}</p>
                                            <p className="text-xs text-gray-500">{order.serviceName}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Providers Placeholder (Static for now) */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Top Performing Providers</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">Provider {item}</p>
                                        <p className="text-xs text-gray-500">Electrician • 4.9 ★</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-900">$1,2{item}0</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
