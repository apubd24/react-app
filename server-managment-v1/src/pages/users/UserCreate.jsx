
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Shield, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Lock
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

const UserCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'readonly',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Validation
  const validate = () => {
    let newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Only letters, numbers, underscore allowed';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 characters required';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Must contain at least 1 uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Must contain at least 1 number';
    }

    // ✅ Confirm Password check
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const payload = {
        fullname: formData.fullname,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        is_active: formData.status === 'active',
      };

      await api.post('api/users', payload);

      toast.success('User created successfully');
      navigate('/users');

    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        toast.error('Unauthorized! Please login again');
      } 
      else if (error.response?.data?.error) {
        const msg = error.response.data.error;

        if (msg.toLowerCase().includes('username')) {
          setErrors(prev => ({
            ...prev,
            username: 'Username already exists'
          }));
        } else {
          toast.error(msg);
        }
      } 
      else {
        toast.error('Server error');
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <button 
        onClick={() => navigate('/users')}
        className="flex items-center text-slate-500 hover:text-blue-600 font-medium"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Users
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900">
            Add New User
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Fullname */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname}</p>}
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Username</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role */}
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

            {/* Status */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'active' })}
                  className={cn(
                    "flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border text-sm font-semibold",
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
                    "flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border text-sm font-semibold",
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

          {/* Buttons */}
          <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">

            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center"
            >
              {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
              Create User
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default UserCreate;




// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   ArrowLeft, 
//   User as UserIcon, 
//   Shield, 
//   CheckCircle2, 
//   XCircle,
//   Loader2,
//   Lock
// } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import { cn } from '../../lib/utils';

// const UserCreate = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fullname: '',
//     username: '',
//     password: '',
//     role: 'readonly',
//     status: 'active',
//   });

//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);

//   // ✅ Validation function
//   const validate = () => {
//     let newErrors = {};

//     // Fullname
//     if (!formData.fullname.trim()) {
//       newErrors.fullname = 'Full name is required';
//     }

//     // Username (min 4 chars, no space)
//     if (!formData.username) {
//       newErrors.username = 'Username is required';
//     } else if (formData.username.length < 4) {
//       newErrors.username = 'Username must be at least 4 characters';
//     } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
//       newErrors.username = 'Only letters, numbers, underscore allowed';
//     }

//     // Password (strong)
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 8) {
//       newErrors.password = 'Minimum 8 characters required';
//     } else if (!/[A-Z]/.test(formData.password)) {
//       newErrors.password = 'Must contain at least 1 uppercase letter';
//     } else if (!/[0-9]/.test(formData.password)) {
//       newErrors.password = 'Must contain at least 1 number';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!validate()) return;

//   setIsLoading(true);

//   try {
//     const payload = {
//       fullname: formData.fullname,
//       username: formData.username,
//       password: formData.password,
//       role: formData.role,
//       is_active: formData.status === 'active',
//     };

//     await api.post('/api/users', payload);

//     toast.success('User created successfully');
//     navigate('/users');

//   } catch (error) {
//     console.error(error);

//     if (error.response?.status === 401) {
//       toast.error('Unauthorized! Please login again');
//     } 
//     else if (error.response?.data?.error) {
//       const msg = error.response.data.error;

//       if (msg.toLowerCase().includes('username')) {
//         setErrors((prev) => ({
//           ...prev,
//           username: 'Username already exists'
//         }));
//       } else {
//         toast.error(msg);
//       }
//     } 
//     else {
//       toast.error('Server error');
//     }

//   } finally {
//     setIsLoading(false);
//   }
// };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       <button 
//         onClick={() => navigate('/users')}
//         className="flex items-center text-slate-500 hover:text-blue-600 font-medium"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back to Users
//       </button>

//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="p-8 border-b border-slate-100 bg-slate-50/50">
//           <h1 className="text-2xl font-bold text-slate-900">
//             Add New User
//           </h1>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//             {/* Fullname */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Full Name</label>
//               <div className="relative">
//                 <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   value={formData.fullname}
//                   onChange={(e) => setFormData({...formData, fullname: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//                 />
//               </div>
//               {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname}</p>}
//             </div>

//             {/* Username */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Username</label>
//               <div className="relative">
//                 <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   value={formData.username}
//                   onChange={(e) => setFormData({...formData, username: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//                 />
//               </div>
//               {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
//             </div>

//             {/* Password */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="password"
//                   value={formData.password}
//                   onChange={(e) => setFormData({...formData, password: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//                 />
//               </div>
//               {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
//             </div>

//             {/* Role */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Role</label>
//               <select 
//                 value={formData.role}
//                 onChange={(e) => setFormData({...formData, role: e.target.value})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               >
//                 <option value="readonly">Readonly</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>

//             {/* Status */}
//             <div className="space-y-1.5 md:col-span-2">
//               <label className="text-sm font-semibold text-slate-700">Status</label>
//               <div className="flex gap-4">
//                 <button
//                   type="button"
//                   onClick={() => setFormData({ ...formData, status: 'active' })}
//                   className={cn(
//                     "flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border text-sm font-semibold",
//                     formData.status === 'active' 
//                       ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
//                       : "bg-slate-50 border-slate-200 text-slate-500"
//                   )}
//                 >
//                   <CheckCircle2 size={16} className="mr-2" />
//                   Active
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setFormData({ ...formData, status: 'inactive' })}
//                   className={cn(
//                     "flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border text-sm font-semibold",
//                     formData.status === 'inactive' 
//                       ? "bg-slate-100 border-slate-300 text-slate-700" 
//                       : "bg-slate-50 border-slate-200 text-slate-500"
//                   )}
//                 >
//                   <XCircle size={16} className="mr-2" />
//                   Inactive
//                 </button>
//               </div>
//             </div>

//           </div>

//           <div className="pt-6 border-t border-slate-100 flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={() => navigate('/users')}
//               className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center"
//             >
//               {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
//               Create User
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default UserCreate;


