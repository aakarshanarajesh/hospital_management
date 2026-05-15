import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bed,
  Package,
  Bot,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    {
      label: 'Patients',
      icon: Users,
      path: '/patients',
      roles: ['doctor', 'admin', 'staff'],
    },
    {
      label: 'Beds',
      icon: Bed,
      path: '/beds',
      roles: ['admin', 'staff'],
    },
    {
      label: 'Schedule',
      icon: Calendar,
      path: '/schedule',
      roles: ['doctor', 'admin'],
    },
    {
      label: 'Resources',
      icon: Package,
      path: '/resources',
      roles: ['admin', 'staff'],
    },
    {
      label: 'Assistant',
      icon: Bot,
      path: '/assistant',
    },
  ];

  const filteredMenu = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-gray-900 text-white transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0'
        } lg:w-64 lg:relative lg:top-0 overflow-hidden lg:block`}
      >
        <div className="p-6 space-y-8">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4">
              Menu
            </h2>
            <nav className="space-y-2">
              {filteredMenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
