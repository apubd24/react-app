import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Shield, 
  CheckCircle2, 
  XCircle,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    role: 'user',
    status: 'active',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/api/users/${id}`);
      // setFormData(response.data);


    console.log('API Response:', response.data); // 🔍 debug

    // ✅ handle different Go response formats
    const user = response.data.user || response.data.data || response.data;

    setFormData({
      fullname: user.fullname || '',
      username: user.username || '',
      role: user.role || 'user',
      status: user.is_active ? 'active' : 'inactive',
    });

    } catch (error) {
      // Mock for demo
      setFormData({
        id: id,
        fullname: 'Enter Your Full Name',
        username: 'Enter Your User name',
        role: 'admin',
        status: 'active',
      });
      toast.error('Using sample data - API failed');
    } finally {
      setIsFetching(false);
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    if (isEdit) {
      // ✅ Convert frontend data → backend format
      const payload = {
        fullname: formData.fullname,
        role: formData.role === 'admin' ? 'admin' : 'readonly',
        is_active: formData.status === 'active',
      };

      await api.put(`/api/users/${id}`, payload);
      toast.success('User updated successfully');
    } else {
      await api.post('/api/users', formData);
      toast.success('User created successfully');
    }

    navigate('/users'); // ✅ FIXED route

  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.error || 'Failed to save user');
  } finally {
    setIsLoading(false);
  }
};


  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/users')}
        className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-medium"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Users
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit User' : 'Add New User'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  required
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Username</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  disabled
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="readonly">Readonly</option>
                  <option value="admin">Admin</option>
                </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'active' })}
                  className={cn(
                    "flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold",
                    formData.status === 'active' 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  )}
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  Active
                </button>
               <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                className={cn(
                  "flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold",
                  formData.status === 'inactive' 
                    ? "bg-slate-100 border-slate-300 text-slate-700" 
                    : "bg-slate-50 border-slate-200 text-slate-500"
                )}
              >
                <XCircle size={16} className="mr-2" />
                Inactive
              </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/api/users')}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center"
            >
              {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
              {isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;



