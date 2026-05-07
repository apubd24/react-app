import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Smartphone, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCcw,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      // Mock data if API fails or for demo
      const mockStats = {
        totalUsers: 1250,
        totalDevices: 450,
        activeDevices: 382,
        deviceGrowth: [
          { name: 'Mon', value: 400 },
          { name: 'Tue', value: 300 },
          { name: 'Wed', value: 600 },
          { name: 'Thu', value: 800 },
          { name: 'Fri', value: 500 },
          { name: 'Sat', value: 900 },
          { name: 'Sun', value: 1100 },
        ],
        userActivity: [
          { name: 'Jan', users: 400 },
          { name: 'Feb', users: 700 },
          { name: 'Mar', users: 500 },
          { name: 'Apr', users: 900 },
          { name: 'May', users: 1100 },
          { name: 'Jun', users: 1300 },
        ]
      };
      setStats(mockStats);
      toast.error('Using sample data - Dashboard API connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'bg-blue-500',
      trend: '+12.5%', 
      isUp: true 
    },
    { 
      label: 'Total Devices', 
      value: stats?.totalDevices || 0, 
      icon: Smartphone, 
      color: 'bg-purple-500',
      trend: '+5.2%', 
      isUp: true 
    },
    { 
      label: 'Active Devices', 
      value: stats?.activeDevices || 0, 
      icon: Activity, 
      color: 'bg-emerald-500',
      trend: '-2.4%', 
      isUp: false 
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center">
          <RefreshCcw className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium">Crunching latest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center"
          >
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-shadow shadow-md shadow-blue-600/20 flex items-center">
            <Plus size={16} className="mr-2" />
            New Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{card.value.toLocaleString()}</h3>
                <div className={`flex items-center mt-3 text-sm font-medium ${card.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {card.isUp ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                  {card.trend}
                  <span className="text-slate-400 ml-2 font-normal">from last month</span>
                </div>
              </div>
              <div className={`${card.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-current/20`}>
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Device Growth</h3>
              <p className="text-sm text-slate-500">Activity throughout the week</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.deviceGrowth}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Activity</h3>
              <p className="text-sm text-slate-500">New user acquisition monthly</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.userActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                  {stats?.userActivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#3b82f6' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
