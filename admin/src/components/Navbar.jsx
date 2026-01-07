
import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
            {/* Left side (Search) */}
            <div className="flex items-center w-96">
                <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Search..."
                    />
                </div>
            </div>

            {/* Right side (Notifications & Profile) */}
            <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none transition-colors relative">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center ml-3">
                    <div className="h-9 w-9 bg-navy-900 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                        <img
                            src="https://ui-avatars.com/api/?name=Admin+User&background=001F54&color=fff"
                            alt="Admin"
                            className="h-9 w-9 rounded-full"
                        />
                    </div>
                    <div className="ml-3 hidden md:block">
                        <p className="text-sm font-medium text-gray-700">Super Admin</p>
                        <p className="text-xs text-gray-500">admin@quickhomies.com</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
