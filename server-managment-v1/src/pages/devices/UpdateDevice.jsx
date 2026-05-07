import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';

const UpdateDevice = () => {

  const navigate = useNavigate();

  // URL PARAM
  const { id } = useParams();

  // LOADING STATES
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ERROR STATE
  const [error, setError] = useState('');

  // FORM DATA
  const [formData, setFormData] = useState({
    name: '',
    serial: '',
    description: '',

    CustomerID: '',
    CustomerName: '',

    DeviceName: '',
    DeviceVendor: '',
    DeviceCategory: '',
    DeviceType: '',

    IpAddress: '',
    SnmpCommunity: '',
    SnmpVersion: 'v1',

    IsActive: true,
  });

  // FETCH DEVICE DATA
  useEffect(() => {

    if (id) {
      fetchDevice();
    }

  }, [id]);

  // GET DEVICE
  const fetchDevice = async () => {

    try {

      setIsFetching(true);

      const response = await api.get(`/api/devices/${id}`);

      console.log('Device API Response:', response.data);

      // HANDLE DIFFERENT RESPONSE FORMAT
      const device =
        response.data.data ||
        response.data.device ||
        response.data;

      // SET EXISTING DATA
      setFormData({
        name: device.name || '',
        serial: device.serial || '',
        description: device.description || '',

        customer_id: device.CustomerID || '',
        customer_name: device.CustomerName || '',

        device_name: device.DeviceName || '',
        device_vendor: device.DeviceVendor || '',
        device_category: device.DeviceCategory || '',
        device_type: device.DeviceType || '',

        ip_address: device.IpAddress || '',
        snmp_community: device.SnmpCommunity || '',
        snmp_version: device.SnmpVersion || 'v1',

        is_active: device.IsActive ?? true,
      });

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.error ||
        'Failed to fetch device'
      );

      toast.error(
        error.response?.data?.error ||
        'Failed to fetch device'
      );

    } finally {

      setIsFetching(false);

    }
  };

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : value,
    }));
  };

  // UPDATE DEVICE
  const handleSubmit = async (e) => {

    e.preventDefault();

    setIsLoading(true);

    try {

      // CLEAN PAYLOAD
      const payload = {
        name: formData.name.trim(),
        serial: formData.serial.trim(),
        description: formData.description.trim(),

        customer_id: Number(formData.customer_id),

        customer_name: formData.customer_name.trim(),
        device_name: formData.device_name.trim(),

        device_vendor: formData.device_vendor,
        device_category: formData.device_category,
        device_type: formData.device_type,

        ip_address: formData.ip_address.trim(),

        snmp_community: formData.snmp_community.trim(),
        snmp_version: formData.snmp_version,

        is_active: formData.is_active,
      };

      console.log('Update Payload:', payload);

      // UPDATE API
      const response = await api.put(
        `/api/devices/${id}`,
        payload,
        {
          timeout: 10000,
        }
      );

      console.log('Update Response:', response.data);

      toast.success('Device updated successfully');

      navigate('/devices');

    } catch (error) {

      console.error('FULL ERROR:', error);

      console.error('ERROR RESPONSE:', error.response?.data);

      // 400
      if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.error ||
          'Validation failed'
        );
        return;
      }

      // 401
      if (error.response?.status === 401) {
        toast.error('Login required');
        return;
      }

      // 403
      if (error.response?.status === 403) {
        toast.error('Permission denied');
        return;
      }

      // 404
      if (error.response?.status === 404) {
        toast.error('Device not found');
        return;
      }

      // 409
      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.error ||
          'Duplicate entry found'
        );
        return;
      }

      toast.error(
        error.response?.data?.error ||
        'Failed to update device'
      );

    } finally {

      setIsLoading(false);

    }
  };

  // FETCHING LOADER
  if (isFetching) {

    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2
          className="animate-spin text-purple-600"
          size={32}
        />
      </div>
    );
  }

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

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">

          <h1 className="text-2xl font-bold text-slate-900">
            Update Device
          </h1>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* DEVICE NAME */}
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                placeholder="Enter description"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none"
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />

            </div>

            {/* DEVICE NAME */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Device Model
              </label>

              <input
                type="text"
                name="device_name"
                required
                value={formData.device_name}
                onChange={handleChange}
                placeholder="Enter device model"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Select Vendor</option>
                <option value="BDCOM">BDCOM</option>
                <option value="VSOL">VSOL</option>
                <option value="HUAWEI">HUAWEI</option>
                <option value="ZTE">ZTE</option>
                <option value="FIBERHOME">FIBERHOME</option>
                <option value="DELL">DELL</option>
              </select>

            </div>

            {/* CATEGORY */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Device Category
              </label>

              <select
                name="device_category"
                required
                value={formData.device_category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Select Category</option>
                <option value="SERVER">SERVER</option>
                <option value="ROUTER">ROUTER</option>
                <option value="SWITCH">SWITCH</option>
                <option value="FIREWALL">FIREWALL</option>
                <option value="OLT">OLT</option>
              </select>

            </div>

            {/* TYPE */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Device Type
              </label>

              <select
                name="device_type"
                required
                value={formData.device_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Select Type</option>
                <option value="EPON">EPON</option>
                <option value="GPON">GPON</option>
                <option value="XPON">XPON</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="POWEREDGE">POWEREDGE</option>
              </select>

            </div>

            {/* IP */}
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
                placeholder="Enter IP address"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                placeholder="Enter SNMP community"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="v1">v1</option>
                <option value="v2">v2</option>
                <option value="V3">V3</option>
              </select>

            </div>

            {/* STATUS */}
            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                name="is_active"
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: e.target.value === 'true',
                  }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                <Loader2
                  className="animate-spin mr-2"
                  size={20}
                />
              ) : (
                <Save className="mr-2" size={18} />
              )}

              Update Device

            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default UpdateDevice;