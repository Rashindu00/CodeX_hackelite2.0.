import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  UserGroupIcon,
  UserIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HeartIcon,
  ShieldCheckIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import {
  UserGroupIcon as UserGroupSolid,
  UserIcon as UserSolid,
  CalendarDaysIcon as CalendarSolid,
  CurrencyDollarIcon as CurrencySolid,
  ChartBarIcon as ChartBarSolid
} from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);

  // Mock admin data
  const [adminData, setAdminData] = useState({
    overview: {
      totalUsers: 1284,
      totalPatients: 1156,
      totalProviders: 128,
      totalAppointments: 2456,
      totalRevenue: 567800,
      systemHealth: 98.5,
      pendingVerifications: 12,
      recentAlerts: 3
    },
    growth: {
      users: 15.2,
      appointments: 8.7,
      revenue: 23.4,
      providers: 6.8
    },
    recentActivities: [
      {
        id: 1,
        type: 'new_patient',
        message: 'New patient registration: Kasun Perera',
        timestamp: '2 minutes ago',
        status: 'success'
      },
      {
        id: 2,
        type: 'provider_verification',
        message: 'Provider verification pending: Dr. Nimal Silva',
        timestamp: '15 minutes ago',
        status: 'pending'
      },
      {
        id: 3,
        type: 'appointment',
        message: 'Emergency appointment booked',
        timestamp: '1 hour ago',
        status: 'warning'
      },
      {
        id: 4,
        type: 'payment',
        message: 'Payment completed: LKR 5,500',
        timestamp: '2 hours ago',
        status: 'success'
      },
      {
        id: 5,
        type: 'system',
        message: 'System backup completed successfully',
        timestamp: '3 hours ago',
        status: 'info'
      }
    ],
    topProviders: [
      {
        id: 1,
        name: 'Dr. Saman Kumara',
        specialty: 'Cardiologist',
        patients: 145,
        rating: 4.9,
        revenue: 85600,
        status: 'active'
      },
      {
        id: 2,
        name: 'Dr. Priya Fernando',
        specialty: 'Dermatologist',
        patients: 132,
        rating: 4.8,
        revenue: 76400,
        status: 'active'
      },
      {
        id: 3,
        name: 'Dr. Ravi Mendis',
        specialty: 'Neurologist',
        patients: 98,
        rating: 4.7,
        revenue: 58900,
        status: 'active'
      }
    ],
    recentPatients: [
      {
        id: 1,
        name: 'Kasun Perera',
        age: 32,
        gender: 'Male',
        lastVisit: '2024-09-24',
        status: 'active',
        appointments: 3
      },
      {
        id: 2,
        name: 'Nimali Silva',
        age: 28,
        gender: 'Female',
        lastVisit: '2024-09-23',
        status: 'active',
        appointments: 7
      },
      {
        id: 3,
        name: 'Sunil Jayawardena',
        age: 45,
        gender: 'Male',
        lastVisit: '2024-09-22',
        status: 'inactive',
        appointments: 12
      }
    ],
    systemMetrics: {
      serverUptime: '99.9%',
      activeConnections: 1247,
      avgResponseTime: '145ms',
      errorRate: '0.01%',
      dataUsage: '78.5GB',
      backupStatus: 'Completed'
    }
  });

  const StatCard = ({ title, value, growth, icon: Icon, color = 'blue', prefix = '', suffix = '', onClick }) => (
    <div 
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'success':
          return 'text-green-600 bg-green-100';
        case 'warning':
          return 'text-yellow-600 bg-yellow-100';
        case 'pending':
          return 'text-blue-600 bg-blue-100';
        case 'error':
          return 'text-red-600 bg-red-100';
        default:
          return 'text-gray-600 bg-gray-100';
      }
    };

    const getStatusIcon = (type) => {
      switch (type) {
        case 'new_patient':
          return UserIcon;
        case 'provider_verification':
          return ShieldCheckIcon;
        case 'appointment':
          return CalendarDaysIcon;
        case 'payment':
          return CurrencyDollarIcon;
        case 'system':
          return ChartBarIcon;
        default:
          return BellIcon;
      }
    };

    const StatusIcon = getStatusIcon(activity.type);

    return (
      <div className="flex items-start space-x-3 py-3">
        <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
          <StatusIcon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{activity.message}</p>
          <p className="text-xs text-gray-500">{activity.timestamp}</p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                System overview and management console
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={adminData.overview.totalUsers}
            growth={adminData.growth.users}
            icon={UserGroupSolid}
            color="blue"
          />
          <StatCard
            title="Healthcare Providers"
            value={adminData.overview.totalProviders}
            growth={adminData.growth.providers}
            icon={UserSolid}
            color="green"
          />
          <StatCard
            title="Total Appointments"
            value={adminData.overview.totalAppointments}
            growth={adminData.growth.appointments}
            icon={CalendarSolid}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={adminData.overview.totalRevenue}
            growth={adminData.growth.revenue}
            icon={CurrencySolid}
            color="yellow"
            prefix="LKR "
          />
        </div>

        {/* System Health & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Health</span>
                <span className="text-sm font-medium text-green-600">{adminData.overview.systemHealth}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${adminData.overview.systemHealth}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Uptime</span>
                  <p className="font-medium">{adminData.systemMetrics.serverUptime}</p>
                </div>
                <div>
                  <span className="text-gray-600">Response Time</span>
                  <p className="font-medium">{adminData.systemMetrics.avgResponseTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">Provider Verifications</span>
                </div>
                <span className="text-sm font-bold text-yellow-800">{adminData.overview.pendingVerifications}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <BellIcon className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">System Alerts</span>
                </div>
                <span className="text-sm font-bold text-red-800">{adminData.overview.recentAlerts}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Connections</span>
                <span className="text-sm font-medium">{adminData.systemMetrics.activeConnections.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="text-sm font-medium text-green-600">{adminData.systemMetrics.errorRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data Usage</span>
                <span className="text-sm font-medium">{adminData.systemMetrics.dataUsage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm font-medium text-green-600">{adminData.systemMetrics.backupStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-1">
              {adminData.recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Top Providers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Providers</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {adminData.topProviders.map((provider, index) => (
                <div key={provider.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                      <p className="text-xs text-gray-600">{provider.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{provider.patients} patients</p>
                    <p className="text-xs text-gray-600">⭐ {provider.rating} rating</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Patients
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Age</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Gender</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Last Visit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Appointments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminData.recentPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{patient.name}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.age}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.gender}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.lastVisit}</td>
                    <td className="py-3 px-4 text-gray-600">{patient.appointments}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:text-green-800">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;