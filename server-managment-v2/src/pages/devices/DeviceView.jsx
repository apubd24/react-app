import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Loader2,
  AlertCircle,
  Tag,
  MapPin,
  Cpu,
  Network,
  Activity
} from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';

const DeviceView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // LOADING & ERROR STATES
  const [device, setDevice] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // FETCH CORE COMPONENT DATA
  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!id) return;
      
      setIsFetching(true);
      setFetchError('');
      try {
        const response = await api.get(`/api/devices/${id}`);
        
        // Handle variations of payload signatures exactly like the Form component
        const data = response.data?.data || response.data?.device || response.data;

        if (!data) {
          throw new Error("No device payload recovered from API endpoint.");
        }

        // Robust normalization of incoming rack_position variants
        let positionsArray = [];
        const rawRackPosition = data.rack_position || data.RackPosition;
        if (rawRackPosition) {
          if (typeof rawRackPosition === 'string') {
            positionsArray = rawRackPosition.split(',').map(pos => pos.trim()).filter(Boolean);
          } else if (Array.isArray(rawRackPosition)) {
            positionsArray = rawRackPosition.map(String);
          }
        }

        // Standardize the item structure for layout mapping
        setDevice({
          ...data,
          rack_position_normalized: positionsArray
        });
      } catch (error) {
        console.error('FETCH ERROR:', error);
        const errMsg = error.response?.data?.error || 'Failed to load device details';
        setFetchError(errMsg);
        toast.error(errMsg);
      } finally {
        setIsFetching(false);
      }
    };

    fetchDeviceData();
  }, [id]);

  // DATA ACQUISITION BLOCKING LOADER
  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="animate-spin text-purple-600" size={40} />
        <p className="text-slate-500 font-medium text-sm">Loading device inventory profile...</p>
      </div>
    );
  }

  // HELPER COMPONENT FOR READONLY DATA ROW
  const DataRow = ({ label, value, highlight = false }) => (
    <div className="py-3.5 border-b border-slate-100 last:border-0 grid grid-cols-3 gap-4 text-sm">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`col-span-2 font-semibold ${highlight ? 'text-purple-600' : 'text-slate-800'}`}>
        {value || <span className="text-slate-400 font-normal italic">Not Configured</span>}
      </span>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* NAVIGATION & ACTION BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/devices')}
          className="flex items-center text-slate-500 hover:text-purple-600 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Inventory
        </button>

        {device && (
          <button
            onClick={() => navigate(`/devices/${id}/edit`)} // Adjust route matching your router setup
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all shadow-md shadow-purple-600/10 active:scale-[0.98]"
          >
            <Edit size={16} className="mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      {/* CORE SYSERROR BANNER CONTAINER */}
      {fetchError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-sm font-medium">{fetchError}</span>
        </div>
      )}

      {device && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* CONTAINER TOPOGRAPHY HEADER */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {device.name || device.device_name}
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  device.is_active || device.IsActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {device.is_active || device.IsActive ? 'Polling Active' : 'Suppressed'}
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1.5 max-w-xl">
                {device.description || "No customized operational descriptions recorded for this asset layout."}
              </p>
            </div>
            
            {/* LARGE STATUS BADGE */}
            <div className="text-right">
              <span className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm border ${
                device.asset_status === 'Live' 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : device.asset_status === 'Team Store'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                <Tag size={12} className="mr-1.5" />
                {device.asset_status || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* SECTION 1: HARDWARE & IDENTITY TARGETS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu size={14} /> Hardware Specifications & Identity
              </h3>
              <div className="bg-slate-50/60 rounded-xl border border-slate-100 p-4 divide-y divide-slate-100">
                <DataRow label="Unique Item ID" value={device.item_id} highlight />
                <DataRow label="Serial Number" value={device.serial} highlight />
                <DataRow label="Device Model Name" value={device.device_name || device.DeviceName} />
                <DataRow label="Hardware Vendor" value={device.device_vendor || device.DeviceVendor} />
                <DataRow label="Device Category" value={device.device_category || device.DeviceCategory} />
                <DataRow label="Hardware Model Ref" value={device.hardware_model || device.HardwareModel || device.HardwareModels} />
                <DataRow label="Rack Height Units" value={device.hardware_height ? `${device.hardware_height} RU` : ''} />
                <DataRow label="Profile Type" value={device.device_type || device.DeviceType} />
              </div>
            </div>

            {/* SECTION 2: INFRASTRUCTURE OWNERSHIP */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} /> Assignment & Ownership
              </h3>
              <div className="bg-slate-50/60 rounded-xl border border-slate-100 p-4 divide-y divide-slate-100">
                <DataRow label="Customer ID" value={device.customer_id !== undefined ? String(device.customer_id) : (device.CustomerID !== undefined ? String(device.CustomerID) : '')} />
                <DataRow label="Customer Designation" value={device.customer_name || device.CustomerName} />
              </div>
            </div>

            {/* SECTION 3: ENVIRONMENTAL LOCATION LAYER */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} /> Logistics & Deployment Physical Layer
              </h3>
              <div className="bg-slate-50/60 rounded-xl border border-slate-100 p-4 divide-y divide-slate-100">
                {device.asset_status === 'Live' ? (
                  <>
                    <DataRow label="Datacenter Allocation" value={device.datacenter_name || device.DatacenterName} />
                    <DataRow label="Facility Rack Frame" value={device.rack_name || device.RackName} />
                    <div className="py-3.5 grid grid-cols-3 gap-4 text-sm">
                      <span className="text-slate-500 font-medium">Grid Assignments</span>
                      <div className="col-span-2 flex flex-wrap gap-1.5">
                        {device.rack_position_normalized?.length > 0 ? (
                          device.rack_position_normalized.map((ru) => (
                            <span key={ru} className="px-2 py-0.5 bg-purple-100/60 text-purple-700 text-xs font-semibold rounded border border-purple-200/50">
                              RU-{ru}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">No slots mapped</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : device.asset_status === 'Team Store' ? (
                  <DataRow label="Warehouse Depot" value={device.team_store_location || device.TeamStoreLocation} />
                ) : (
                  <div className="p-2 text-sm text-slate-400 italic">
                    Asset is currently un-deployed. Dynamic structural tracking metrics are offline.
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: MANAGEMENT & MONITORING ARTIFACTS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Network size={14} /> Management & OOB Telemetry
              </h3>
              <div className="bg-slate-50/60 rounded-xl border border-slate-100 p-4 divide-y divide-slate-100">
                <DataRow label="Out-of-Band IP" value={device.ip_address || device.IpAddress} highlight />
                <DataRow label="SNMP Read Community" value={device.snmp_community || device.SnmpCommunity} />
                <DataRow label="SNMP Protocol Target" value={
                  device.snmp_version === 'v2c' || device.SnmpVersion === 'v2c' 
                    ? 'Version 2c' 
                    : (device.snmp_version || device.SnmpVersion || 'v1')
                } />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceView;