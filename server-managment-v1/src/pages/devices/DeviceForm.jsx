







import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  Loader2,
  Save,
} from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';


const DeviceForm = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    serial: '',
    description: '',

    customer_id: '',
    customer_name: '',

    device_name: '',
    device_vendor: '',
    device_category: '',
    device_type: '',

    ip_address: '',
    snmp_community: '',
    snmp_version: 'v1',

    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {

    e.preventDefault();

    setIsLoading(true);

    try {

      // ✅ CLEAN PAYLOAD
      const payload = {
        name: formData.name.trim(),
        serial: formData.serial.trim(),
        description: formData.description.trim(),

        // ✅ uint64 in Golang
        customer_id: Number(formData.customer_id),

        // ✅ EXACT JSON FIELD NAME MATCH WITH GOLANG
        customer_name: formData.customer_name.trim(),
        device_name: formData.device_name.trim(),
        device_vendor: formData.device_vendor,
        device_category: formData.device_category,
        device_type: formData.device_type,

        ip_address: formData.ip_address.trim(),
        snmp_community: formData.snmp_community.trim(),
        snmp_version: formData.snmp_version,

        // ✅ bool
        is_active: formData.is_active,
      };

      console.log('Submitting Device Payload:', payload);

      // ✅ CORRECT API
      const response = await api.post('/api/devices/', payload, { 
              timeout: 10000,  // Submition will failafter 10000 sec
            });

      console.log('API Response:', response.data);

      toast.success('Device created successfully');

      navigate('/devices');

    } catch (error) {

      console.error('FULL ERROR:', error);

      console.error('ERROR RESPONSE:', error.response?.data);

      // 403
      if (error.response?.status === 403) {
        toast.error('Admin permission required');
        return;
      }

      // 401
      if (error.response?.status === 401) {
        toast.error('Login required');
        return;
      }

      // 409
      if (error.response?.status === 409) {
        toast.error(error.response?.data?.error);
        return;
      }

      // 400
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.error || 'Validation failed');
        return;
      }

      toast.error(
        error.response?.data?.error ||
        'Failed to create device'
      );

    } finally {

      setIsLoading(false);

    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate('/devices')}
        className="flex items-center text-slate-500 hover:text-purple-600 transition-colors font-medium"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Inventory
      </button>

      {/* CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900">
            Add New Device
          </h1>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* NAME */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Device Name
              </label>

              <div className="relative">

                <Tag
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter device name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                />

              </div>
            </div>

            {/* SERIAL */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Serial Number
              </label>

              <input
                type="text"
                name="serial"
                required
                value={formData.serial}
                onChange={handleChange}
                placeholder="Enter serial number"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />

            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1.5 md:col-span-2">

              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
              />

            </div>

            {/* CUSTOMER ID */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Customer ID
              </label>

              <input
                type="number"
                name="customer_id"
                required
                value={formData.customer_id}
                onChange={handleChange}
                placeholder="Enter customer ID"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />

            </div>

            {/* CUSTOMER NAME */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Customer Name
              </label>

              <input
                type="text"
                name="customer_name"
                required
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Customer Name"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />

            </div>

            {/* DEVICE NAME */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Device Name
              </label>

              <input
                type="text"
                name="device_name"
                required
                value={formData.device_name}
                onChange={handleChange}
                placeholder="Enter Device Name"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />

            </div>

            {/* DEVICE VENDOR */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Device Vendor
              </label>

              <select
                name="device_vendor"
                required
                value={formData.device_vendor}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              >
                <option value="">Select Vendor</option>
                <option value="BDCOM">BDCOM</option>
                <option value="VSOL">VSOL</option>
                <option value="HUAWEI">HUAWEI</option>
                <option value="DELL">DELL</option>
              </select>

            </div>

            {/* DEVICE CATEGORY */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Device Category
              </label>

               <select
                name="device_category"
                required
                value={formData.device_category}
                onChange={handleChange}
                placeholder="Select category"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              >
              <option value="">Category</option>
              <option value="SERVER">SERVER</option>
              <option value="ROUTER">ROUTER</option>
              <option value="SWITCH">SWITCH</option>
              </select>

            </div>

            {/* DEVICE TYPE */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Device Type
              </label>

              <select 
                name="device_type"
                required
                value={formData.device_type}
                onChange={handleChange}
                placeholder="Enter device type"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              >
              <option value="">Type</option>
              <option value="POWEREDGE">POWEREDGE</option>
              <option value="EDGE">EDGE</option>
              </select>

            </div>

            {/* IP ADDRESS */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                IP Address
              </label>

              <input
                type="text"
                name="ip_address"
                required
                value={formData.ip_address}
                onChange={handleChange}
                placeholder="Enter IP Address"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />

            </div>

            {/* SNMP COMMUNITY */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                SNMP Community
              </label>

              <input
                type="text"
                name="snmp_community"
                required
                value={formData.snmp_community}
                onChange={handleChange}
                placeholder="Enter snmp community"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />

            </div>

            {/* SNMP VERSION */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                SNMP Version
              </label>

              <select
                name="snmp_version"
                value={formData.snmp_version}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              >
                <option value="v1">v1</option>
                <option value="v2">v2</option>
                <option value="v3">v3</option>
              </select>

            </div>

              {/* ACTIVE STATUS */}
              <div className="space-y-1.5">

                <label className="text-sm font-semibold text-slate-700">
                  Status
                </label>

                  <select
                    name="is_active"
                    value={String(formData.is_active)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.value === 'true',
                      }))
                    }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

              </div>      

    </div>

          {/* FOOTER */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-end space-x-4">

            <button
              type="button"
              onClick={() => navigate('/devices')}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center"
            >

              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <Save className="mr-2" size={18} />
              )}

              Create Device

            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default DeviceForm;








// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   ArrowLeft, 
//   Globe, 
//   Tag, 
//   Loader2,
//   Monitor
// } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// const DeviceForm = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: '',
//     serial: '',
//     description: '',

//     customer_id: 1,
//     customer_name: '',

//     device_name: '',
//     device_vendor: '',
//     device_category: '',
//     device_type: '',

//     ip_address: '',
//     snmp_community: '',
//     snmp_version: 'v2',

//     is_active: true,
//   });

//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       await api.post('/devices', formData);

//       toast.success('New device registered successfully');
//       navigate('/devices');

//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to create device');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       <button 
//         onClick={() => navigate('/devices')}
//         className="flex items-center text-slate-500 hover:text-purple-600 transition-colors font-medium"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back to Inventory
//       </button>

//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="p-8 border-b border-slate-100 bg-slate-50/50">
//           <h1 className="text-2xl font-bold text-slate-900">
//             Register New Device
//           </h1>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-6">

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//             {/* Name */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Display Name</label>
//               <div className="relative">
//                 <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//                 />
//               </div>
//             </div>

//             {/* Serial */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Serial</label>
//               <input 
//                 type="text"
//                 required
//                 value={formData.serial}
//                 onChange={(e) => setFormData({...formData, serial: e.target.value})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               />
//             </div>

//             {/* Description */}
//             <div className="space-y-1.5 md:col-span-2">
//               <label className="text-sm font-semibold text-slate-700">Description</label>
//               <textarea 
//                 value={formData.description}
//                 onChange={(e) => setFormData({...formData, description: e.target.value})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               />
//             </div>

//             {/* Customer */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Customer ID</label>
//               <input 
//                 type="number"
//                 required
//                 value={formData.customer_id}
//                 onChange={(e) => setFormData({...formData, customer_id: Number(e.target.value)})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Customer Name</label>
//               <input 
//                 type="text"
//                 required
//                 value={formData.customer_name}
//                 onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               />
//             </div>

//             {/* Device Info */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Device Name</label>
//               <input 
//                 type="text"
//                 required
//                 value={formData.device_name}
//                 onChange={(e) => setFormData({...formData, device_name: e.target.value})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Vendor</label>
//               <input 
//                 type="text"
//                 required
//                 value={formData.device_vendor}
//                 onChange={(e) => setFormData({...formData, device_vendor: e.target.value})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Category</label>
//               <div className="relative">
//                 <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   required
//                   value={formData.device_category}
//                   onChange={(e) => setFormData({...formData, device_category: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Device Type</label>
//               <input 
//                 type="text"
//                 required
//                 value={formData.device_type}
//                 onChange={(e) => setFormData({...formData, device_type: e.target.value})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               />
//             </div>

//             {/* IP */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">IP Address</label>
//               <div className="relative">
//                 <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   required
//                   value={formData.ip_address}
//                   onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
//                 />
//               </div>
//             </div>

//             {/* SNMP */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">SNMP Community</label>
//               <input 
//                 type="text"
//                 required
//                 value={formData.snmp_community}
//                 onChange={(e) => setFormData({...formData, snmp_community: e.target.value})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">SNMP Version</label>
//               <select 
//                 value={formData.snmp_version}
//                 onChange={(e) => setFormData({...formData, snmp_version: e.target.value})}
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
//               >
//                 <option value="v1">v1</option>
//                 <option value="v2">v2</option>
//                 <option value="v3">v3</option>
//               </select>
//             </div>

//           </div>

//           <div className="pt-8 border-t border-slate-100 flex items-center justify-end space-x-4">
//             <button
//               type="button"
//               onClick={() => navigate('/devices')}
//               className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="px-8 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex items-center"
//             >
//               {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
//               Register Device
//             </button>
//           </div>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default DeviceForm;













// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   ArrowLeft,
//   Tag,
//   Loader2,
//   Save,
// } from 'lucide-react';

// import api from '../../services/api';
// import toast from 'react-hot-toast';

// const DeviceForm = () => {

//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: '',
//     serial: '',
//     description: '',
//   });

//   const [isLoading, setIsLoading] = useState(false);

//   // HANDLE INPUT CHANGE
//   const handleChange = (e) => {

//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // SUBMIT FORM
//   const handleSubmit = async (e) => {

//     e.preventDefault();

//     setIsLoading(true);

//     try {

//       // CLEAN PAYLOAD
//       const payload = {
//         name: formData.name.trim(),
//         serial: formData.serial.trim(),
//         description: formData.description.trim(),
//       };

//       console.log('Submitting Product:', payload);

//       // ✅ CORRECT API URL
//       const response = await api.post('/api/products', payload);

//       console.log('API Response:', response.data);

//       toast.success('Product created successfully');

//       navigate('/devices');

//     } catch (error) {

//       console.error('FULL ERROR:', error);

//       console.error('ERROR RESPONSE:', error.response);

//       // 403
//       if (error.response?.status === 403) {

//         toast.error('Admin permission required');
//         return;
//       }

//       // 401
//       if (error.response?.status === 401) {

//         toast.error('Login required');
//         return;
//       }

//       // DEFAULT
//       toast.error(
//         error.response?.data?.error ||
//         'Failed to create product'
//       );

//     } finally {

//       setIsLoading(false);

//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">

//       {/* BACK BUTTON */}
//       <button
//         onClick={() => navigate('/devices')}
//         className="flex items-center text-slate-500 hover:text-purple-600 transition-colors font-medium"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back to Inventory
//       </button>

//       {/* CARD */}
//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

//         {/* HEADER */}
//         <div className="p-8 border-b border-slate-100 bg-slate-50/50">
//           <h1 className="text-2xl font-bold text-slate-900">
//             Create New Product
//           </h1>
//         </div>

//         {/* FORM */}
//         <form onSubmit={handleSubmit} className="p-8 space-y-6">

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//             {/* NAME */}
//             <div className="space-y-1.5">

//               <label className="text-sm font-semibold text-slate-700">
//                 Device Name
//               </label>

//               <div className="relative">

//                 <Tag
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   size={18}
//                 />

//                 <input
//                   type="text"
//                   name="name"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Enter device name"
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
//                 />

//               </div>
//             </div>

//             {/* SERIAL */}
//             <div className="space-y-1.5">

//               <label className="text-sm font-semibold text-slate-700">
//                 Serial Number
//               </label>

//               <input
//                 type="text"
//                 name="serial"
//                 required
//                 value={formData.serial}
//                 onChange={handleChange}
//                 placeholder="Enter serial number"
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
//               />

//             </div>

//             {/* DESCRIPTION */}
//             <div className="space-y-1.5 md:col-span-2">

//               <label className="text-sm font-semibold text-slate-700">
//                 Description
//               </label>

//               <textarea
//                 name="description"
//                 rows={4}
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Enter product description"
//                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
//               />

//             </div>

//           </div>

//           {/* FOOTER */}
//           <div className="pt-8 border-t border-slate-100 flex items-center justify-end space-x-4">

//             <button
//               type="button"
//               onClick={() => navigate('/devices')}
//               className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="px-8 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center"
//             >

//               {isLoading ? (
//                 <Loader2 className="animate-spin mr-2" size={20} />
//               ) : (
//                 <Save className="mr-2" size={18} />
//               )}

//               Create Device

//             </button>

//           </div>

//         </form>

//       </div>
//     </div>
//   );
// };

// export default DeviceForm;
























// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Globe, Tag, Loader2, Monitor } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// const DeviceForm = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: '',
//     serial: '',
//     description: '',
//     customer_id: 1,
//     customer_name: '',
//     device_name: '',
//     device_vendor: '',
//     device_category: '',
//     device_type: '',
//     ip_address: '',
//     snmp_community: '',
//     snmp_version: 'v2',
//     is_active: true,
//   });

//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const payload = {
//         name: formData.name,
//         serial: formData.serial,
//         description: formData.description,
//         customer_id: Number(formData.customer_id),
//         customer_name: formData.customer_name, // ✅ FIXED
//         device_name: formData.device_name,
//         device_vendor: formData.device_vendor,
//         device_category: formData.device_category,
//         device_type: formData.device_type,
//         ip_address: formData.ip_address,
//         snmp_community: formData.snmp_community,
//         snmp_version: formData.snmp_version,
//         is_active: formData.is_active,
//       };

//       console.log("Submitting:", payload);

//       await api.post('/api/devices', payload);

//       toast.success('New device registered successfully');
//       navigate('/devices');

//     } catch (error) {
//       console.error("API ERROR:", error.response?.data || error.message);

//       toast.error(
//         error.response?.data?.error ||
//         'Failed to create device'
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       <button 
//         onClick={() => navigate('/devices')}
//         className="flex items-center text-slate-500 hover:text-purple-600 transition-colors font-medium"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back to Inventory
//       </button>

//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="p-8 border-b border-slate-100 bg-slate-50/50">
//           <h1 className="text-2xl font-bold text-slate-900">
//             Register New Device
//           </h1>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-6">

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//             <input required placeholder="Name"
//               value={formData.name}
//               onChange={(e)=>setFormData({...formData,name:e.target.value})}
//               className="input" />

//             <input required placeholder="Serial"
//               value={formData.serial}
//               onChange={(e)=>setFormData({...formData,serial:e.target.value})}
//               className="input" />

//             <input required placeholder="Customer Name"
//               value={formData.customer_name}
//               onChange={(e)=>setFormData({...formData,customer_name:e.target.value})}
//               className="input" />

//             <input required placeholder="Device Name"
//               value={formData.device_name}
//               onChange={(e)=>setFormData({...formData,device_name:e.target.value})}
//               className="input" />

//             <input required placeholder="IP Address"
//               value={formData.ip_address}
//               onChange={(e)=>setFormData({...formData,ip_address:e.target.value})}
//               className="input" />

//             <input required placeholder="SNMP Community"
//               value={formData.snmp_community}
//               onChange={(e)=>setFormData({...formData,snmp_community:e.target.value})}
//               className="input" />

//             <select required
//               value={formData.device_vendor}
//               onChange={(e)=>setFormData({...formData,device_vendor:e.target.value})}
//               className="input">
//               <option value="">Vendor</option>
//               <option value="DELL">DELL</option>
//               <option value="MIKROTIK">MIKROTIK</option>
//               <option value="CISCO">CISCO</option>
//             </select>

//             <select required
//               value={formData.device_category}
//               onChange={(e)=>setFormData({...formData,device_category:e.target.value})}
//               className="input">
//               <option value="">Category</option>
//               <option value="SERVER">SERVER</option>
//               <option value="ROUTER">ROUTER</option>
//               <option value="SWITCH">SWITCH</option>
//             </select>

//             <select required
//               value={formData.device_type}
//               onChange={(e)=>setFormData({...formData,device_type:e.target.value})}
//               className="input">
//               <option value="">Type</option>
//               <option value="POWEREDGE">POWEREDGE</option>
//               <option value="CCR">CCR</option>
//               <option value="EDGE">EDGE</option>
//             </select>

//             <select
//               value={formData.is_active ? 'true':'false'}
//               onChange={(e)=>setFormData({...formData,is_active:e.target.value==='true'})}
//               className="input">
//               <option value="true">Active</option>
//               <option value="false">Disabled</option>
//             </select>

//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="px-8 py-2.5 bg-purple-600 text-white rounded-xl font-bold flex items-center"
//           >
//             {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
//             Register Device
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default DeviceForm;






// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   ArrowLeft, 
//   Globe, 
//   Tag, 
//   Save,
//   Loader2,
//   Monitor,
//   Hash,
//   FileText,
//   Users,
//   Building2,
//   Package,
//   Layers,
//   Wifi,
//   Shield,
//   Activity,
//   Key,
//   Cpu,
//   List
// } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// const DeviceForm = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: '',
//     serial: '',
//     description: '',
//     customerId: '',
//     customerName: '',
//     deviceName: '',
//     vendor: '',
//     category: '',
//     type: '',
//     ipAddress: '',
//     snmpCommunity: '',
//     snmpVersion: 'v2c',
//     isActive: true,
//   });
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     // Validate required fields
//     if (!formData.name || !formData.serial || !formData.ipAddress) {
//       toast.error('Name, Serial Number, and IP Address are required');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       await api.post('/devices', formData);
//       toast.success('New device registered successfully');
//       navigate('/devices');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to save device');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       <button 
//         onClick={() => navigate('/devices')}
//         className="flex items-center text-slate-500 hover:text-purple-600 transition-colors font-medium"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back to Inventory
//       </button>

//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="p-8 border-b border-slate-100 bg-slate-50/50">
//           <h1 className="text-2xl font-bold text-slate-900">
//             Register New Device
//           </h1>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Device Basic Information */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">
//                 Device Name <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
//                   placeholder="e.g. Living Room Gateway"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">
//                 Serial Number <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   required
//                   value={formData.serial}
//                   onChange={(e) => setFormData({...formData, serial: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono text-sm"
//                   placeholder="e.g. SN-12345-6789"
//                 />
//               </div>
//             </div>

//             {/* IP and Status */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">
//                 IP Address <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   required
//                   value={formData.ipAddress}
//                   onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono text-sm"
//                   placeholder="e.g. 192.168.1.1"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Device Status</label>
//               <div className="relative">
//                 <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <select 
//                   value={formData.isActive ? 'online' : 'disabled'}
//                   onChange={(e) => setFormData({...formData, isActive: e.target.value === 'online'})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all appearance-none"
//                 >
//                   <option value="online">Online (Active)</option>
//                   <option value="disabled">Disabled (Inactive)</option>
//                 </select>
//               </div>
//             </div>

//             {/* Device Identification */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Display Name</label>
//               <div className="relative">
//                 <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   value={formData.deviceName}
//                   onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
//                   placeholder="e.g. Main Gateway Display"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Vendor</label>
//               <div className="relative">
//                 <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   value={formData.vendor}
//                   onChange={(e) => setFormData({...formData, vendor: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
//                   placeholder="e.g. Cisco, Ubiquiti, Hikvision"
//                 />
//               </div>
//             </div>

//             {/* Category and Type */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Category</label>
//               <div className="relative">
//                 <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   value={formData.category}
//                   onChange={(e) => setFormData({...formData, category: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
//                   placeholder="e.g. Gateway, Sensor, Camera"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Type</label>
//               <div className="relative">
//                 <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   value={formData.type}
//                   onChange={(e) => setFormData({...formData, type: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
//                   placeholder="e.g. Edge Router, Temperature Sensor"
//                 />
//               </div>
//             </div>

//             {/* Customer Information */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Customer ID</label>
//               <div className="relative">
//                 <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   value={formData.customerId}
//                   onChange={(e) => setFormData({...formData, customerId: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono text-sm"
//                   placeholder="e.g. CUST-001"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Customer Name</label>
//               <div className="relative">
//                 <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   value={formData.customerName}
//                   onChange={(e) => setFormData({...formData, customerName: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
//                   placeholder="e.g. Acme Corporation"
//                 />
//               </div>
//             </div>

//             {/* SNMP Configuration */}
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">SNMP Community</label>
//               <div className="relative">
//                 <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   value={formData.snmpCommunity}
//                   onChange={(e) => setFormData({...formData, snmpCommunity: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono text-sm"
//                   placeholder="e.g. public, private"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">SNMP Version</label>
//               <div className="relative">
//                 <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <select 
//                   value={formData.snmpVersion}
//                   onChange={(e) => setFormData({...formData, snmpVersion: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all appearance-none"
//                 >
//                   <option value="v1">SNMP v1</option>
//                   <option value="v2c">SNMP v2c</option>
//                   <option value="v3">SNMP v3</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Description - Full Width */}
//           <div className="space-y-1.5">
//             <label className="text-sm font-semibold text-slate-700">Description</label>
//             <div className="relative">
//               <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
//               <textarea 
//                 rows={3}
//                 value={formData.description}
//                 onChange={(e) => setFormData({...formData, description: e.target.value})}
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
//                 placeholder="Enter device description, purpose, location notes, etc."
//               />
//             </div>
//           </div>

//           <div className="pt-8 border-t border-slate-100 flex items-center justify-end space-x-4">
//             <button
//               type="button"
//               onClick={() => navigate('/devices')}
//               className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all font-sans"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="px-8 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center"
//             >
//               {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
//               Register Device
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default DeviceForm;


















// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { 
//   ArrowLeft, 
//   Globe, 
//   Tag, 
//   Save,
//   Loader2,
//   Monitor
// } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// const DeviceForm = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const isEdit = !!id;

//   const [formData, setFormData] = useState({
//     name: '',
//     ipAddress: '',
//     status: 'offline',
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(isEdit);

//   useEffect(() => {
//     if (isEdit) {
//       fetchDevice();
//     }
//   }, [id]);

//   const fetchDevice = async () => {
//     try {
//       const response = await api.get(`/devices/${id}`);
//       setFormData(response.data);
//     } catch (error) {
//       // Mock for demo
//       setFormData({
//         id: id,
//         name: 'Gateway 01',
//         ipAddress: '192.168.1.10',
//         status: 'online',
//       });
//       toast.error('Using sample data - API failed');
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       if (isEdit) {
//         await api.put(`/devices/${id}`, formData);
//         toast.success('Device settings updated');
//       } else {
//         await api.post('/devices', formData);
//         toast.success('New device registered successfully');
//       }
//       navigate('/devices');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to save device');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isFetching) {
//     return (
//       <div className="flex items-center justify-center h-[50vh]">
//         <Loader2 className="animate-spin text-purple-600" size={32} />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       <button 
//         onClick={() => navigate('/devices')}
//         className="flex items-center text-slate-500 hover:text-purple-600 transition-colors font-medium"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back to Inventory
//       </button>

//       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="p-8 border-b border-slate-100 bg-slate-50/50">
//           <h1 className="text-2xl font-bold text-slate-900">
//             {isEdit ? 'Configure Device' : 'Register New Device'}
//           </h1>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Display Name</label>
//               <div className="relative">
//                 <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   required
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
//                   placeholder="e.g. Living Room Gateway"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">IP Address</label>
//               <div className="relative">
//                 <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <input 
//                   type="text"
//                   required
//                   value={formData.ipAddress}
//                   onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-mono text-sm"
//                   placeholder="e.g. 192.168.1.1"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">Category</label>
//               <div className="relative">
//                 <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <select 
//                   className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all appearance-none"
//                 >
//                   <option>Gateway Controller</option>
//                   <option>Smart Sensor Hub</option>
//                   <option>Security Camera</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="pt-8 border-t border-slate-100 flex items-center justify-end space-x-4">
//             <button
//               type="button"
//               onClick={() => navigate('/devices')}
//               className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all font-sans"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="px-8 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center"
//             >
//               {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
//               {isEdit ? 'Save Changes' : 'Register Device'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default DeviceForm;
