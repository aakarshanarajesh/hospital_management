import React from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-red-500';
      case 'doctor':
        return 'bg-blue-500';
      case 'staff':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">🏥 HMS</h1>
            <p className="text-sm text-gray-600 ml-2">Hospital Management</p>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700 font-semibold">
                    {user.name}
                  </span>
                  <span
                    className={`${getRoleBadgeColor()} text-white px-3 py-1 rounded-full text-sm capitalize`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden pb-4 space-y-2">
            <div className="flex items-center justify-between p-2">
              <span className="text-gray-700 font-semibold">{user.name}</span>
              <span
                className={`${getRoleBadgeColor()} text-white px-3 py-1 rounded-full text-sm capitalize`}
              >
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
