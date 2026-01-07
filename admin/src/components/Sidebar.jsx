
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Wrench,
    Calendar,
    Settings,
    LogOut,
    Briefcase,
    Star
} from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Users', path: '/users' },
        { icon: Briefcase, label: 'Service Providers', path: '/providers' },
        { icon: Wrench, label: 'Services', path: '/services' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: Star, label: 'Reviews', path: '/reviews' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="bg-[#001F54] text-white w-64 min-h-screen flex flex-col transition-all duration-300">
            <div className="p-6 border-b border-[#1a3a6e]">
                <h1 className="text-2xl font-bold tracking-wider">QuickHomies</h1>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Super Admin</p>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-[#003080] text-white border-r-4 border-[#0ea5e9]'
                                        : 'text-gray-300 hover:bg-[#003080] hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-[#1a3a6e]">
                <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
