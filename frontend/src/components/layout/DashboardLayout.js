import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  HomeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserIcon,
  Cog6ToothIcon,
  HeartIcon,
  UserGroupIcon,
  VideoCameraIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { logoutUser } from '../../store/slices/authSlice';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getNavigationItems = () => {
    if (user?.role === 'patient') {
      return [
        { name: 'Dashboard', href: '/patient', icon: HomeIcon },
        { name: 'AI Medical Assistant', href: '/patient/chatbot', icon: ChatBubbleLeftEllipsisIcon },
        { name: 'Book Appointment', href: '/patient/appointment-booking', icon: CalendarDaysIcon },
        { name: 'Video Consultation', href: '/patient/video-consultation', icon: VideoCameraIcon },
        { name: 'Health Records', href: '/patient/health-records', icon: DocumentTextIcon },
        { name: 'Medical History', href: '/patient/history', icon: ClockIcon },
        { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
        { name: 'Symptom Checker', href: '/patient/symptom-checker', icon: HeartIcon },
        { name: 'Profile', href: '/profile', icon: UserIcon },
      ];
    } else if (user?.role === 'provider') {
      return [
        { name: 'Dashboard', href: '/provider', icon: HomeIcon },
        { name: 'AI Medical Assistant', href: '/provider/chatbot', icon: ChatBubbleLeftEllipsisIcon },
        { name: 'Patients', href: '/provider/patients', icon: UserGroupIcon },
        { name: 'Appointments', href: '/provider/appointments', icon: CalendarDaysIcon },
        { name: 'Consultations', href: '/provider/consultations', icon: VideoCameraIcon },
        { name: 'Reports', href: '/provider/reports', icon: ClipboardDocumentListIcon },
        { name: 'Profile', href: '/profile', icon: UserIcon },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Patients', href: '/admin/patients', icon: UserGroupIcon },
        { name: 'Providers', href: '/admin/providers', icon: UserIcon },
        { name: 'Reports', href: '/admin/reports', icon: ClipboardDocumentListIcon },
        { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex h-full flex-col">
              {/* Mobile Logo with close button */}
              <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <span className="ml-3 text-xl font-semibold text-gray-900">MediConnect</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-teal-100 text-teal-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile User Info */}
              <div className="px-6 py-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize truncate">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    isLoggingOut 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white shadow-lg flex-shrink-0">
        <div className="flex h-full flex-col w-full">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">MediConnect</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 space-y-3">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                isLoggingOut 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </>
              ) : (
                <>
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile header with menu button */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">MediConnect</span>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
        
        <div className="h-full overflow-y-auto md:h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
