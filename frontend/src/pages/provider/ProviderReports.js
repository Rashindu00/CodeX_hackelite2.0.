import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ChartBarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PrinterIcon,
  ShareIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarSolid,
  CalendarDaysIcon as CalendarSolid,
  UserGroupIcon as UserGroupSolid,
  CurrencyDollarIcon as CurrencySolid
} from '@heroicons/react/24/solid';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ProviderReports = () => {
  const { user } = useSelector(state => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for reports
  const [reportData, setReportData] = useState({
    overview: {
      totalPatients: 156,
      patientsGrowth: 12.5,
      totalAppointments: 234,
      appointmentsGrowth: 8.3,
      totalConsultations: 189,
      consultationsGrowth: 15.2,
      totalRevenue: 75680,
      revenueGrowth: 18.7
    },
    appointments: {
      completed: 189,
      cancelled: 23,
      noShow: 12,
      rescheduled: 15,
      upcoming: 45
    },
    patients: {
      newPatients: 28,
      returningPatients: 128,
      byAge: {
        '0-18': 15,
        '19-35': 45,
        '36-50': 52,
        '51-65': 34,
        '65+': 10
      },
      byGender: {
        male: 68,
        female: 88
      }
    },
    consultations: {
      byType: {
        'General Consultation': 85,
        'Follow-up': 45,
        'Emergency': 12,
        'Specialist Referral': 28,
        'Routine Checkup': 19
      },
      avgDuration: 24,
      satisfactionScore: 4.7
    },
    revenue: {
      thisMonth: 25680,
      lastMonth: 22340,
      byService: {
        'Consultation Fee': 18500,
        'Diagnostic Tests': 4200,
        'Treatment Procedures': 2980
      }
    }
  });

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const reportTypes = [
    { value: 'overview', label: 'Overview', icon: ChartBarIcon },
    { value: 'appointments', label: 'Appointments', icon: CalendarDaysIcon },
    { value: 'patients', label: 'Patients', icon: UserGroupIcon },
    { value: 'consultations', label: 'Consultations', icon: DocumentTextIcon },
    { value: 'revenue', label: 'Revenue', icon: CurrencyDollarIcon }
  ];

  const StatCard = ({ title, value, growth, icon: Icon, color = 'blue', prefix = '', suffix = '' }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
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

  const OverviewReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={reportData.overview.totalPatients}
          growth={reportData.overview.patientsGrowth}
          icon={UserGroupSolid}
          color="blue"
        />
        <StatCard
          title="Total Appointments"
          value={reportData.overview.totalAppointments}
          growth={reportData.overview.appointmentsGrowth}
          icon={CalendarSolid}
          color="green"
        />
        <StatCard
          title="Consultations"
          value={reportData.overview.totalConsultations}
          growth={reportData.overview.consultationsGrowth}
          icon={DocumentTextIcon}
          color="purple"
        />
        <StatCard
          title="Revenue"
          value={reportData.overview.totalRevenue}
          growth={reportData.overview.revenueGrowth}
          icon={CurrencySolid}
          color="yellow"
          prefix="LKR "
        />
      </div>

      {/* Quick Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Patient Growth</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              {reportData.overview.patientsGrowth}% increase in new patients this month
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <ChartBarSolid className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">High Satisfaction</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              4.7/5 average patient satisfaction rating
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <CurrencySolid className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">Revenue Growth</span>
            </div>
            <p className="text-xs text-purple-700 mt-1">
              LKR {reportData.overview.totalRevenue.toLocaleString()} earned this month
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const AppointmentsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Completed" value={reportData.appointments.completed} color="green" />
        <StatCard title="Cancelled" value={reportData.appointments.cancelled} color="red" />
        <StatCard title="No Show" value={reportData.appointments.noShow} color="orange" />
        <StatCard title="Rescheduled" value={reportData.appointments.rescheduled} color="yellow" />
        <StatCard title="Upcoming" value={reportData.appointments.upcoming} color="blue" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status Distribution</h3>
        <div className="space-y-3">
          {Object.entries(reportData.appointments).map(([key, value]) => {
            const total = Object.values(reportData.appointments).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const colors = {
              completed: 'bg-green-500',
              cancelled: 'bg-red-500',
              noShow: 'bg-orange-500',
              rescheduled: 'bg-yellow-500',
              upcoming: 'bg-blue-500'
            };
            
            return (
              <div key={key} className="flex items-center">
                <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[key]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {value} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const PatientsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="New Patients" value={reportData.patients.newPatients} color="green" />
        <StatCard title="Returning Patients" value={reportData.patients.returningPatients} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
          <div className="space-y-3">
            {Object.entries(reportData.patients.byAge).map(([ageGroup, count]) => {
              const total = Object.values(reportData.patients.byAge).reduce((a, b) => a + b, 0);
              const percentage = ((count / total) * 100).toFixed(1);
              
              return (
                <div key={ageGroup} className="flex items-center">
                  <div className="w-16 text-sm font-medium text-gray-700">{ageGroup}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-right">
                    {count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <div className="space-y-3">
            {Object.entries(reportData.patients.byGender).map(([gender, count]) => {
              const total = Object.values(reportData.patients.byGender).reduce((a, b) => a + b, 0);
              const percentage = ((count / total) * 100).toFixed(1);
              const color = gender === 'male' ? 'bg-blue-500' : 'bg-pink-500';
              
              return (
                <div key={gender} className="flex items-center">
                  <div className="w-16 text-sm font-medium text-gray-700 capitalize">{gender}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-right">
                    {count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const ConsultationsReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Consultations" value={reportData.overview.totalConsultations} color="blue" />
        <StatCard title="Avg Duration" value={reportData.consultations.avgDuration} suffix=" min" color="green" />
        <StatCard title="Satisfaction Score" value={reportData.consultations.satisfactionScore} suffix="/5" color="yellow" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultations by Type</h3>
        <div className="space-y-3">
          {Object.entries(reportData.consultations.byType).map(([type, count]) => {
            const total = Object.values(reportData.consultations.byType).reduce((a, b) => a + b, 0);
            const percentage = ((count / total) * 100).toFixed(1);
            
            return (
              <div key={type} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-700">{type}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const RevenueReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="This Month" value={reportData.revenue.thisMonth} prefix="LKR " color="green" />
        <StatCard title="Last Month" value={reportData.revenue.lastMonth} prefix="LKR " color="blue" />
        <StatCard 
          title="Growth" 
          value={((reportData.revenue.thisMonth - reportData.revenue.lastMonth) / reportData.revenue.lastMonth * 100).toFixed(1)} 
          suffix="%" 
          color="yellow" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
        <div className="space-y-3">
          {Object.entries(reportData.revenue.byService).map(([service, amount]) => {
            const total = Object.values(reportData.revenue.byService).reduce((a, b) => a + b, 0);
            const percentage = ((amount / total) * 100).toFixed(1);
            
            return (
              <div key={service} className="flex items-center">
                <div className="w-40 text-sm font-medium text-gray-700">{service}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-24 text-sm text-gray-600 text-right">
                  LKR {amount.toLocaleString()} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return <OverviewReport />;
      case 'appointments':
        return <AppointmentsReport />;
      case 'patients':
        return <PatientsReport />;
      case 'consultations':
        return <ConsultationsReport />;
      case 'revenue':
        return <RevenueReport />;
      default:
        return <OverviewReport />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track your practice performance and insights
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <EyeIcon className="w-4 h-4 mr-2" />
                View
              </button>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print
              </button>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <ShareIcon className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Report Type Selector */}
            <div className="flex flex-wrap gap-2">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedReport(type.value)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      selectedReport === type.value
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* Period Selector */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="min-h-96">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading report data...</p>
              </div>
            </div>
          ) : (
            renderReportContent()
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderReports;