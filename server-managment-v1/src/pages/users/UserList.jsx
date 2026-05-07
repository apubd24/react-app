import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2,
  XCircle,
  Loader2,
  Key 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/users/');

      // ✅ Normalize API response → UI format
      const formattedUsers = (response.data.users || []).map(u => ({
        id: u.id,
        fullname: u.fullname,
        username: u.username,
        role: u.role,
        status: u.is_active ? "active" : "inactive",
        createdAt: u.created_at
      }));

      setUsers(formattedUsers);

    } catch (error) {
      console.error(error);

      // ✅ Fallback mock data
      const mockUsers = [
        { id: '1', fullname: 'Admin', username: 'admin', role: 'admin', status: 'active' },
        { id: '2', fullname: 'User One', username: 'user1', role: 'user', status: 'inactive' },
      ];

      setUsers(mockUsers);
      toast.error('Using sample data - User API connection failed');

    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/api/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // ✅ Filter logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Users className="mr-3 text-blue-600" size={28} />
            User Management
          </h1>
          <p className="text-slate-500">View and manage all system users.</p>
        </div>

        <button 
          // onClick={() => navigate('/users/add')}
          onClick={() => navigate('/users/create')}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
        >
          <Plus size={18} className="mr-2" />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex gap-2">
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="readonly">ReadOnly</option>
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Username</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fullname</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>

                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
                      <span className="text-slate-500">Loading users...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 transition"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">

                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3 uppercase text-sm">
                            {user.username?.charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">{user.username}</p>
                            <p className="text-sm text-slate-500">ID: {user.id}</p>
                          </div>

                        </div>
                      </td>

                      {/* Fullname */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">

                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3 uppercase text-sm">
                            {user.fullname?.charAt(0)}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">{user.fullname}</p>
                          </div>

                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                          user.role === 'admin'
                            ? "bg-purple-100 text-purple-700"
                            : user.role === 'editor'
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        )}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {user.status === 'active' ? (
                          <div className="flex items-center">
                            <CheckCircle2 size={16} className="text-emerald-500 mr-2" />
                            <span className="text-sm text-emerald-600">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle size={16} className="text-slate-400 mr-2" />
                            <span className="text-sm text-slate-500">Inactive</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="p-2 hover:text-blue-600"
                        >
                          <Edit size={18} />
                        </button>


                        <button
                          onClick={() => navigate(`/users/change-password/${user.id}`)}
                          className="p-2 hover:text-yellow-600"
                        >
                         <Key size={18} />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>

                    </motion.tr>
                  ))
                )}

              </AnimatePresence>
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;