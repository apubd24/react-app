import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 👁️ toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    let newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Minimum 8 characters required';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Must contain at least 1 uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Must contain at least 1 lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Must contain at least 1 number';
    } else if (!/[@$!%*?&#]/.test(password)) {
      newErrors.password = 'Must contain at least 1 special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (password !== confirmPassword) {
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
      await api.put(`/api/users/${id}/password`, {
        password: password
      });

      toast.success('Password updated successfully');
      navigate('/users');

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">

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
            Change Password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Enter new password"
              />

              {/* 👁️ toggle icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}

            <p className="text-xs text-slate-500">
              Use 8+ chars, uppercase, lowercase, number & special character
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Confirm Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Confirm password"
              />

              {/* 👁️ toggle icon */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center"
            >
              {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
              Update Password
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ChangePassword;




// import React, { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// const ChangePassword = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);

//   // 🔐 Validation
//   const validate = () => {
//     let newErrors = {};

//     if (!password) {
//       newErrors.password = 'Password is required';
//     } else if (password.length < 8) {
//       newErrors.password = 'Minimum 8 characters required';
//     } else if (!/[A-Z]/.test(password)) {
//       newErrors.password = 'Must contain at least 1 uppercase letter';
//     } else if (!/[a-z]/.test(password)) {
//       newErrors.password = 'Must contain at least 1 lowercase letter';
//     } else if (!/[0-9]/.test(password)) {
//       newErrors.password = 'Must contain at least 1 number';
//     } else if (!/[@$!%*?&#]/.test(password)) {
//       newErrors.password = 'Must contain at least 1 special character';
//     }

//     if (!confirmPassword) {
//       newErrors.confirmPassword = 'Please confirm password';
//     } else if (password !== confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validate()) return;

//     setIsLoading(true);

//     try {
//       await api.put(`/api/users/${id}/password`, {
//         password: password
//       });

//       toast.success('Password updated successfully');
//       navigate('/users');

//     } catch (error) {
//       console.error(error);
//       toast.error(error.response?.data?.error || 'Failed to update password');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto space-y-6">

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
//             Change Password
//           </h1>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-6">

//           {/* Password */}
//           <div className="space-y-1.5">
//             <label className="text-sm font-semibold text-slate-700">
//               New Password
//             </label>

//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//                 placeholder="Enter new password"
//               />
//             </div>

//             {errors.password && (
//               <p className="text-red-500 text-sm">{errors.password}</p>
//             )}

//             {/* Password hint */}
//             <p className="text-xs text-slate-500">
//               Use 8+ chars, uppercase, lowercase, number & special character
//             </p>
//           </div>

//           {/* Confirm Password */}
//           <div className="space-y-1.5">
//             <label className="text-sm font-semibold text-slate-700">
//               Confirm Password
//             </label>

//             <div className="relative">
//               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//               <input
//                 type="password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//                 placeholder="Confirm password"
//               />
//             </div>

//             {errors.confirmPassword && (
//               <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
//             )}
//           </div>

//           <div className="pt-6 border-t border-slate-100 flex justify-end">
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center"
//             >
//               {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
//               Update Password
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChangePassword;

