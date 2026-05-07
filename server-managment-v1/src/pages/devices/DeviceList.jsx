import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Wifi,
  WifiOff,
  Ban,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

const DeviceList1 = () => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (error) {
      // Mock data
      const mockDevices = [
        { id: '1', name: 'Gateway 01', ipAddress: '192.168.1.10', status: 'online', lastActive: '2 mins ago' },
        { id: '2', name: 'Sensor Hub A', ipAddress: '192.168.1.15', status: 'offline', lastActive: '12 hours ago' },
      ];
      setDevices(mockDevices);
      toast.error('Using sample data - Device API failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('Are you sure you want to remove this device?')) return;
    
    try {
      await api.delete(`/devices/${id}`);
      setDevices(devices.filter(d => d.id !== id));
      toast.success('Device removed successfully');
    } catch (error) {
      toast.error('Failed to remove device');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'disabled' ? 'offline' : 'disabled';
    try {
      await api.patch(`/devices/${id}/status`, { status: newStatus });
      setDevices(devices.map(d => d.id === id ? { ...d, status: newStatus } : d));
      toast.success(`Device ${newStatus} successfully`);
    } catch (error) {
      // Fallback update for demo
      setDevices(devices.map(d => d.id === id ? { ...d, status: newStatus } : d));
      toast.success(`Device updated (Note: Backend update failed)`);
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          device.ipAddress.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Smartphone className="mr-3 text-purple-600" size={28} />
            Device Inventory
          </h1>
          <p className="text-slate-500">Manage connected hardware and gateway devices.</p>
        </div>
        <button 
          onClick={() => navigate('/devices/add')}
          className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98]"
        >
          <Plus size={18} className="mr-2" />
          Add Device
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or IP..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm font-medium"
        >
          <option value="all">All States</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center">
              <Loader2 className="animate-spin text-purple-600 mb-2" size={32} />
              <span className="text-slate-500">Scanning network...</span>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500">
               No devices found.
            </div>
          ) : (
            filteredDevices.map((device) => (
              <motion.div 
                key={device.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-purple-200 hover:shadow-md transition-all h-full flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      device.status === 'online' ? "bg-emerald-100 text-emerald-600" :
                      device.status === 'offline' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {device.status === 'online' ? <Wifi size={24} /> : 
                       device.status === 'offline' ? <WifiOff size={24} /> : <Ban size={24} />}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/devices/edit/${device.id}`)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteDevice(device.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-bold text-slate-900 text-lg">{device.name}</h3>
                    <p className="text-slate-500 font-mono text-xs mt-1">{device.ipAddress}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        device.status === 'online' ? "bg-emerald-500 animate-pulse" :
                        device.status === 'offline' ? "bg-amber-500" : "bg-slate-400"
                      )}></div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{device.status}</span>
                    </div>
                    <span className="text-xs text-slate-400">Last active: {device.lastActive}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
                  <button 
                    onClick={() => handleToggleStatus(device.id, device.status)}
                    className="py-3 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    {device.status === 'disabled' ? 'Enable' : 'Disable'}
                  </button>
                  <button className="py-3 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-purple-600 transition-colors">
                    Logs
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeviceList1;
