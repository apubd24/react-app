





import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  datacenters, 
  racksByDatacenter, 
  rackPositions, 
  assetStatusOptions, 
  teamStoreLocations, 
  hardwareModels,
  deviceTypes,           // ["Standalone", "Multi Node"]
  multiNodeDevices,      // ["8Node Supermicro-1", "8Node Supermicro-2", ...]
  hardwarecategorys, 
  hardwareHeights, 
  snmpGroups,
  snmpVersions
} from "../hooks/useCommonHooks";
import {
  ArrowLeft,
  Tag,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';

const DeviceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // LOADING & ERROR STATES
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [fetchError, setFetchError] = useState('');

  // CUSTOMER DROPDOWN POOL STATE
  const [customers, setCustomers] = useState([]);


useEffect(() => {
  api.get("/api/customers/dropdown")
    .then((res) => {
      // Adjusted checks to flexibly accept both 'res.data.data' or an implicit root array 'res.data'
      const extractedCustomers = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setCustomers(extractedCustomers);
    })
    .catch((err) => console.error("Error retrieving core customer listing matrices:", err));
}, []);


  // UNIFIED COMPREHENSIVE INITIAL STATE
  const [formData, setFormData] = useState({
    name: '',
    serial: '',
    description: '',
    customer_id: '',
    customer_name: '',
    device_name: '',
    device_vendor: '',
    device_category: '',
    hardware_model: '',
    
    // SUB-ROUTING FIELDS
    device_type: '',               // Will store 'Standalone' or 'Multi Node' in client UI 
    selected_multi_node_model: '', // Local collector for exact multi-node selections
    hardware_height: '',
    snmp_group: '',

    // ASSET LOCATION LAYER CONFIGURATION
    asset_status: '',
    datacenter_name: '',
    rack_name: '',
    rack_position: [], // Managed explicitly as array for Standalone / Compiled string placeholder
    team_store_location: '',

    // DYNAMIC MULTI-NODE 42U RACK TRACKING STATE MATRIX
    multiNodeRackMatrix: Array.from({ length: 42 }, (_, i) => String(i + 1)).reduce((acc, unit) => {
      acc[unit] = { checked: false, text: '' };
      return acc;
    }, {}),

    // MANAGEMENT & MONITORING
    ip_address: '',
    snmp_community: '',
    snmp_version: 'v1',
    is_active: true,
  });

  // Derived helper variable to track if either "Multi Node" layout option is explicitly selected
  const isCurrentSelectionMultiNode = formData.device_type === 'Multi Node' ||
    multiNodeDevices.includes(formData.device_type);

  // ITEM ID GENERATION HELPERS
  const parseDeviceItemId = (itemId) => {
    if (typeof itemId !== 'string') return 0;
    const match = itemId.match(/^DVC-(\d+)$/i);
    return match ? Number(match[1]) || 0 : 0;
  };

  const generateItemId = (sequence = 1) => {
    return `DVC-${String(sequence).padStart(4, '0')}`;
  };

  const buildNextItemId = (existingDevices = []) => {
    const highestIndex = existingDevices.reduce((maxIndex, device) => {
      const rawItemId = device.item_id || device.ItemId || device.ItemID || '';
      return Math.max(maxIndex, parseDeviceItemId(rawItemId));
    }, 0);

    return generateItemId(highestIndex + 1);
  };

  useEffect(() => {
    if (isEditMode) return;

    const fetchNextItemId = async () => {
      try {
        const response = await api.get('/api/devices');
        const rawDevices = response.data.devices || response.data.data || [];
        const nextItemId = buildNextItemId(rawDevices);
        setFormData((prev) => ({ ...prev, item_id: nextItemId }));
      } catch (error) {
        console.error('ITEM_ID FETCH ERROR:', error);
        setFormData((prev) => ({ ...prev, item_id: generateItemId(1) }));
      }
    };

    fetchNextItemId();
  }, [isEditMode]);

  // FETCH CORE COMPONENT DATA IF ID IS PRESENT
  useEffect(() => {
    const fetchDeviceData = async () => {
      if (!isEditMode) return;
      
      setIsFetching(true);
      setFetchError('');
      try {
        const response = await api.get(`/api/devices/${id}`);
        const device = response.data?.data || response.data?.device || response.data;

        if (!device) {
          throw new Error("No device payload recovered from API endpoint.");
        }

        // DECODE LOGIC FOR SINGLE COLUMN SYSTEM
        const databaseDeviceTypeValue = device.device_type || device.DeviceType || '';
        let uiDeviceType = databaseDeviceTypeValue;
        let uiMultiNodeModel = '';

        if (multiNodeDevices.includes(databaseDeviceTypeValue)) {
          uiDeviceType = 'Multi Node';
          uiMultiNodeModel = databaseDeviceTypeValue;
        }

        let positionsArray = [];
        let extractedRackMatrix = Array.from({ length: 42 }, (_, i) => String(i + 1)).reduce((acc, unit) => {
          acc[unit] = { checked: false, text: '' };
          return acc;
        }, {});

        const rawRackPosition = device.rack_position || device.RackPosition;
        if (rawRackPosition) {
          const splitPositions = typeof rawRackPosition === 'string' 
            ? rawRackPosition.split(',').map(pos => pos.trim()).filter(Boolean)
            : [];

          if (uiDeviceType === 'Multi Node') {
            splitPositions.forEach((item) => {
              const match = item.match(/^(\d+)U-(.*)$/i);
              if (match) {
                const unitNumber = match[1];
                const textValue = match[2];
                if (extractedRackMatrix[unitNumber]) {
                  extractedRackMatrix[unitNumber] = {
                    checked: true,
                    text: textValue
                  };
                }
              } else {
                const numericFallback = item.replace(/U/gi, '');
                if (extractedRackMatrix[numericFallback]) {
                  extractedRackMatrix[numericFallback] = { checked: true, text: '' };
                }
              }
            });
          } else {
            positionsArray = splitPositions;
          }
        }

        setFormData({
          name: device.name || '',
          serial: device.serial || '',
          description: device.description || '',
          customer_id: device.customer_id !== undefined ? String(device.customer_id) : (device.CustomerID !== undefined ? String(device.CustomerID) : ''),
          customer_name: device.customer_name || device.CustomerName || '',
          device_name: device.device_name || device.DeviceName || '',
          device_vendor: device.device_vendor || device.DeviceVendor || '',
          device_category: device.device_category || device.DeviceCategory || '',
          hardware_model: device.hardware_model || device.HardwareModel || device.HardwareModels || '',
          
          device_type: uiDeviceType,
          selected_multi_node_model: uiMultiNodeModel,
          
          hardware_height: device.hardware_height || device.HardwareHeight || device.HardwareHeight || '',
          snmp_group: device.snmp_group || device.SnmpGroup || '',
          asset_status: device.asset_status || device.AssetStatus || '',
          datacenter_name: device.datacenter_name || device.DatacenterName || '',
          rack_name: device.rack_name || device.RackName || '',
          
          rack_position: positionsArray,
          multiNodeRackMatrix: extractedRackMatrix,
          
          team_store_location: device.team_store_location || device.TeamStoreLocation || '',
          ip_address: device.ip_address || device.IpAddress || '',
          snmp_community: device.snmp_community || device.SnmpCommunity || '',
          snmp_version: device.snmp_version || device.SnmpVersion || 'v1',
          is_active: device.is_active !== undefined ? device.is_active : (device.IsActive !== undefined ? device.IsActive : true),
          item_id: device.item_id || device.ItemId || device.ItemID || '',
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
  }, [id, isEditMode]);

  // CENTRAL INPUT MUTATION LOGIC
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // SPECIAL HANDLING: DYNAMICALLY INJECT CUSTOMER DETAILS
    if (name === 'customer_id') {
      if (value === '') {
        updatedData.customer_id = '';
        // updatedData.customer_name = '';
      } else {
        // Find matching item inside database matrices list
        const selectedCustomer = customers.find(c => String(c.id) === String(value));
        if (selectedCustomer) {
          updatedData.customer_id = String(selectedCustomer.id);
          // updatedData.customer_name = selectedCustomer.company_name || selectedCustomer.name || '';
        }
      }
    }

      if (name === 'device_type') {
        if (value !== 'Multi Node' && !multiNodeDevices.includes(value)) {
          updatedData.selected_multi_node_model = '';
          updatedData.multiNodeRackMatrix = Array.from({ length: 42 }, (_, i) => String(i + 1)).reduce((acc, unit) => {
            acc[unit] = { checked: false, text: '' };
            return acc;
          }, {});
        } else {
          updatedData.rack_position = [];
        }
      }

      if (name === 'asset_status') {
        if (value !== 'Live' && value !== 'Available') {
          updatedData.datacenter_name = '';
          updatedData.rack_name = '';
          updatedData.rack_position = [];
          updatedData.multiNodeRackMatrix = Array.from({ length: 42 }, (_, i) => String(i + 1)).reduce((acc, unit) => {
            acc[unit] = { checked: false, text: '' };
            return acc;
          }, {});
        }
        if (value !== 'Team Store') {
          updatedData.team_store_location = '';
        }
      }

      if (name === 'datacenter_name') {
        updatedData.rack_name = '';
        updatedData.rack_position = []; 
        updatedData.multiNodeRackMatrix = Array.from({ length: 42 }, (_, i) => String(i + 1)).reduce((acc, unit) => {
          acc[unit] = { checked: false, text: '' };
          return acc;
        }, {});
      }

      return updatedData;
    });
  };

  // MULTIPLE CHECKBOX POSITION ARRAY SETTER
  const handleRackPositionChange = (uValue) => {
    const targetValue = String(uValue);
    setFormData((prev) => {
      const currentPositions = [...prev.rack_position];
      if (currentPositions.includes(targetValue)) {
        return { ...prev, rack_position: currentPositions.filter((pos) => pos !== targetValue) };
      } else {
        return { ...prev, rack_position: [...currentPositions, targetValue] };
      }
    });
  };

  // MULTI NODE 42U MATRIX RECORD HANDLER MUTATOR
  const handleMatrixCellChange = (unitKey, fieldProperty, incomingValue) => {
    setFormData((prev) => {
      const updatedMatrix = { ...prev.multiNodeRackMatrix };
      updatedMatrix[unitKey] = {
        ...updatedMatrix[unitKey],
        [fieldProperty]: incomingValue
      };
      return {
        ...prev,
        multiNodeRackMatrix: updatedMatrix
      };
    });
  };

  // MUTATE OR CREATE CALL HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const derivedDeviceTypeField = formData.device_type === 'Multi Node' 
        ? formData.selected_multi_node_model 
        : formData.device_type;

      let calculatedRackPositionPayload = "";
      
      if (formData.asset_status === 'Live' || formData.asset_status === 'Available') {
        if (isCurrentSelectionMultiNode) {
          calculatedRackPositionPayload = Object.keys(formData.multiNodeRackMatrix)
            .filter((unitKey) => formData.multiNodeRackMatrix[unitKey].checked)
            .map((unitKey) => {
              const enteredText = formData.multiNodeRackMatrix[unitKey].text.trim();
              return `${unitKey}U-${enteredText}`;
            })
            .join(', ');
        } else {
          calculatedRackPositionPayload = formData.rack_position.join(',');
        }
      }

      const isPhysicalStatus = formData.asset_status === 'Live' || formData.asset_status === 'Available';

      const payload = {
        name: formData.name.trim(),
        serial: formData.serial.trim(),
        description: formData.description.trim(),
        customer_id: Number(formData.customer_id),
        customer_name: formData.customer_name.trim(),
        device_name: formData.device_name.trim(),
        device_vendor: formData.device_vendor,
        device_category: formData.device_category,
        hardware_model: formData.hardware_model,
        device_type: derivedDeviceTypeField, 
        hardware_height: formData.hardware_height,
        snmp_group: formData.snmp_group,
        asset_status: formData.asset_status,
        datacenter_name: isPhysicalStatus ? formData.datacenter_name : "",
        rack_name: isPhysicalStatus ? formData.rack_name : "",
        rack_position: calculatedRackPositionPayload, 
        team_store_location: formData.asset_status === 'Team Store' ? formData.team_store_location : "",
        ip_address: formData.ip_address.trim(),
        snmp_community: formData.snmp_community.trim(),
        snmp_version: formData.snmp_version,
        is_active: formData.is_active,
        item_id: formData.item_id || generateItemId(1),
      };

      console.log(`Submitting Payload (${isEditMode ? 'EDIT' : 'CREATE'}):`, payload);

      if (isEditMode) {
        await api.put(`/api/devices/${id}`, payload, { timeout: 10000 });
        toast.success('Device updated successfully');
      } else {
        await api.post('/api/devices/', payload, { timeout: 10000 });
        toast.success('Device created successfully');
      }

      navigate('/devices');
    } catch (error) {
      console.error('SUBMIT ERROR:', error);
      const status = error.response?.status;
      if (status === 400) {
        toast.error(error.response?.data?.error || 'Validation failed');
      } else if (status === 401) {
        toast.error('Login required');
      } else if (status === 403) {
        toast.error('Permission denied to mutate device');
      } else if (status === 404) {
        toast.error('Target device not found');
      } else if (status === 409) {
        toast.error(error.response?.data?.error || 'Duplicate asset records discovered');
      } else {
        toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} device`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="animate-spin text-purple-600" size={40} />
        <p className="text-slate-500 font-medium text-sm">Loading device profile information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">

      <button
        onClick={() => navigate('/devices')}
        className="flex items-center text-slate-500 hover:text-purple-600 transition-colors font-medium text-sm"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Inventory
      </button>

      {fetchError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-sm font-medium">{fetchError}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Update Device Configuration' : 'Add New Device Profile'}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {isEditMode ? 'Modify tracking elements, identifiers, and configuration assignments.' : 'Provision database inventory records for newly received corporate infrastructure.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

            {/* FIELD: HOSTNAME/ASSET TAG */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Asset Label / Hostname</label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. edge-router-01"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* FIELD: SERIAL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Serial Number</label>
              <input
                type="text"
                name="serial"
                required
                value={formData.serial}
                onChange={handleChange}
                placeholder="Enter serial number"
                className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            {/* FIELD: DESCRIPTION */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Description / Details</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about system purpose or technical assignments"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm resize-none"
              />
            </div>

{/* FIELD: DYNAMIC CUSTOMER MATRIX SELECTION */}
<div className="space-y-1.5 md:col-span-2">
  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
    Assigned Customer Account
  </label>
  <select
    name="customer_id"
    required
    value={formData.customer_id}
    onChange={handleChange}
    className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
  >
    <option value="">Select Account Holder...</option>
    {customers.map((cust) => (
      <option key={cust.id} value={cust.id}>
        {cust.company_name} (ID: {cust.id})
      </option>
    ))}
  </select>
  
  {/* Optional Hidden tracking check input or passive confirmation label
  {formData.customer_name && (
    <p className="text-xs text-purple-600 font-medium pl-1 mt-1">
      Active Link: <span className="font-bold">{formData.customer_name}</span> will be submitted with reference identifier #{formData.customer_id}.
    </p>
  )} */}
</div>


            {/* FIELD: DEVICE NAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Device Model Display Name</label>
              <input
                type="text"
                name="device_name"
                required
                value={formData.device_name}
                onChange={handleChange}
                placeholder="e.g. CloudEngine 6800"
                className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            {/* FIELD: VENDOR DROPDOWN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Device Vendor</label>
              <select
                name="device_vendor"
                required
                value={formData.device_vendor}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              >
                <option value="">Select Vendor</option>
                <option value="BDCOM">BDCOM</option>
                <option value="VSOL">VSOL</option>
                <option value="HUAWEI">HUAWEI</option>
                <option value="DELL">DELL</option>
              </select>
            </div>

            {/* FIELD: CATEGORY DROPDOWN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Device Category</label>
              <select
                name="device_category"
                required
                value={formData.device_category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              >
                <option value="">Select Category</option>
                {hardwarecategorys.map((cat, idx) => (
                  <option key={`cat-${cat}-${idx}`} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* FIELD: HARDWARE MODELS */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Hardware Model</label>
              <select
                name="hardware_model"
                required
                value={formData.hardware_model}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              >
                <option value="">Choose Model</option>
                {hardwareModels.map((m, idx) => (
                  <option key={`m-${m}-${idx}`} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* FIELD: DEVICE TYPES DROPDOWN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Device Type</label>
              <select
                name="device_type"
                required
                value={formData.device_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              >
                <option value="">Choose Type</option>
                {deviceTypes.map((typeItem, idx) => (
                  <option key={`type-${typeItem}-${idx}`} value={typeItem}>{typeItem}</option>
                ))}
              </select>
            </div>

            {/* DYNAMIC ADDITIONAL FIELD: RENDER ONLY IF MULTI NODE CHASSIS OPTION TRIGGERED */}
            {formData.device_type === 'Multi Node' && (
              <div className="space-y-1.5 md:col-span-2 p-4 bg-purple-50/40 border border-purple-100 rounded-xl animate-fadeIn">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1">
                  Multi Node Hardware Option
                </label>
                <select
                  name="selected_multi_node_model"
                  required={formData.device_type === 'Multi Node'}
                  value={formData.selected_multi_node_model}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm"
                >
                  <option value="">Choose Specific Multi Node Infrastructure Configuration</option>
                  {multiNodeDevices.map((nodeOption, idx) => (
                    <option key={`node-opt-${nodeOption}-${idx}`} value={nodeOption}>
                      {nodeOption}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* FIELD: HARDWARE HEIGHTS */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Hardware Height Rack Unit (RU)</label>
              <select
                name="hardware_height"
                required
                value={formData.hardware_height}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              >
                <option value="">Choose Size</option>
                {hardwareHeights.map((h, idx) => (
                  <option key={`h-${h}-${idx}`} value={h}>{h}</option>
                ))}
              </select>
            </div>

            {/* FIELD: STATUS ROOT TRIGGER ELEMENT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Asset Tracking Status</label>
              <select
                name="asset_status"
                required
                value={formData.asset_status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              >
                <option value="">Select Asset Status</option>
                {assetStatusOptions.map((statusItem, idx) => (
                  <option key={`status-${statusItem}-${idx}`} value={statusItem}>{statusItem}</option>
                ))}
              </select>
            </div>

            {/* SECTION LAYER: DYNAMIC PHYSICAL ENVIRONMENT RACK POSITIONING */}
            {(formData.asset_status === 'Live' || formData.asset_status === 'Available') && (
              <div className="md:col-span-2 p-6 border border-purple-100 bg-purple-50/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                
                {/* SUBFIELD: DATACENTER */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Datacenter Allocation</label>
                  <select
                    name="datacenter_name"
                    required={formData.asset_status === 'Live' || formData.asset_status === 'Available'}
                    value={formData.datacenter_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
                  >
                    <option value="">Select Target Datacenter Facility</option>
                    {datacenters.map((dc, idx) => (
                      <option key={`dc-${dc}-${idx}`} value={dc}>{dc}</option>
                    ))}
                  </select>
                </div>

                {/* SUBFIELD: RACK NAME */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Rack Identifier</label>
                  <select
                    name="rack_name"
                    required={formData.asset_status === 'Live' || formData.asset_status === 'Available'}
                    disabled={!formData.datacenter_name}
                    value={formData.rack_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm disabled:opacity-60 disabled:bg-slate-100"
                  >
                    <option value="">Choose Targeted Rack Chassis</option>
                    {(racksByDatacenter[formData.datacenter_name] || []).map((rack, idx) => (
                      <option key={`rack-${rack}-${idx}`} value={rack}>{rack}</option>
                    ))}
                  </select>
                </div>

                {/* DYNAMIC FIELD BLOCK LAYOUT: STANDALONE POSITION MULTI-CHECKBOX SELECTOR */}
                {!isCurrentSelectionMultiNode && (
                  <div className="space-y-2 md:col-span-2 border-t border-slate-100 pt-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Assigned Unit Spaces (RU Position)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {rackPositions.map((unit) => {
                        const isChecked = formData.rack_position.includes(String(unit));
                        return (
                          <button
                            type="button"
                            key={`standalone-ru-${unit}`}
                            onClick={() => handleRackPositionChange(unit)}
                            disabled={!formData.rack_name}
                            className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                              isChecked
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            } disabled:opacity-40 disabled:pointer-events-none`}
                          >
                            {unit}U
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* DYNAMIC FIELD BLOCK LAYOUT: MULTI-NODE CHASSIS INTERACTION RACK MATRIX GRID */}
                {isCurrentSelectionMultiNode && (
                  <div className="space-y-3 md:col-span-2 border-t border-slate-200 pt-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-sm font-bold tracking-tight text-purple-900">
                        Multi-Node RU Deployment Matrix Mapping (42U)
                      </label>
                      <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        Select RU and specify servers (e.g., 1U-2U or 6U-8U)
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 max-h-[250px] overflow-y-auto shadow-inner p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                      {Array.from({ length: 42 }, (_, i) => String(42 - i)).map((unitKey) => {
                        const cellData = formData.multiNodeRackMatrix[unitKey] || { checked: false, text: '' };
                        return (
                          <div 
                            key={`matrix-row-${unitKey}`} 
                            className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                              cellData.checked 
                                ? 'bg-white border-purple-300 shadow-sm ring-1 ring-purple-100' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-10 text-[11px] font-extrabold px-1.5 py-1 rounded text-center shrink-0 ${
                              cellData.checked ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {unitKey}U
                            </span>
                            
                            <input
                              type="checkbox"
                              disabled={!formData.rack_name}
                              checked={cellData.checked}
                              onChange={(e) => handleMatrixCellChange(unitKey, 'checked', e.target.checked)}
                              className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 transition-all cursor-pointer disabled:opacity-40"
                            />

                            <input
                              type="text"
                              placeholder={cellData.checked ? "e.g., 1U-2U or 6U-8U" : "Unassigned slot"}
                              disabled={!cellData.checked || !formData.rack_name}
                              value={cellData.text}
                              onChange={(e) => handleMatrixCellChange(unitKey, 'text', e.target.value)}
                              className="flex-1 min-w-0 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-purple-500 focus:bg-white transition-all disabled:opacity-40 disabled:bg-slate-100 text-slate-800 font-medium placeholder-slate-400"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION LAYER: TEAM STORE TRACKING CONTROL ELEMENT */}
            {formData.asset_status === 'Team Store' && (
              <div className="md:col-span-2 p-5 border border-amber-100 bg-amber-50/10 rounded-2xl space-y-1.5 animate-fadeIn mt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-800">Internal Storage Facility/Location</label>
                <select
                  name="team_store_location"
                  required={formData.asset_status === 'Team Store'}
                  value={formData.team_store_location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-sm"
                >
                  <option value="">Choose Targeted Internal Holding Area</option>
                  {teamStoreLocations.map((loc, idx) => (
                    <option key={`store-${loc}-${idx}`} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            )}

            {/* FIELD: IP ADDRESS */}
            <div className="space-y-1.5 border-t border-slate-100 md:col-span-2 pt-5 mt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">IP Management Address</label>
              <input
                type="text"
                name="ip_address"
                required
                value={formData.ip_address}
                onChange={handleChange}
                placeholder="e.g. 192.168.10.25"
                className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            {/* FIELD: SNMP COMMUNITY */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">SNMP Community String</label>
              <input
                type="text"
                name="snmp_community"
                required
                value={formData.snmp_community}
                onChange={handleChange}
                placeholder="e.g. public"
                className="w-full px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              />
            </div>

            {/* FIELD: SNMP VERSION */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">SNMP Version Protocol</label>
              <select
                name="snmp_version"
                required
                value={formData.snmp_version}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              >
                {snmpVersions.map((v, idx) => (
                  <option key={`v-${v}-${idx}`} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* FIELD: SNMP GROUP */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">SNMP Polling Group</label>
              <select
                name="snmp_group"
                required
                value={formData.snmp_group}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              >
                <option value="">Choose Sync Group</option>
                {snmpGroups.map((g, idx) => (
                  <option key={`g-${g}-${idx}`} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* FIELD: MONITORING STATE SWITCH */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Polling Status</label>
              <select
                name="is_active"
                value={String(formData.is_active)}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-sm"
              >
                <option value="true">Active Polling Enabled</option>
                <option value="false">Inactive / Suppressed</option>
              </select>
            </div>      

          </div>

          {/* BLOCK ACTION CONTROLS FOOTER */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/devices')}
              className="px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all shadow-md shadow-purple-600/10 active:scale-[0.99] disabled:opacity-70 flex items-center"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Save className="mr-2" size={16} />
              )}
              {isEditMode ? 'Save System Upgrades' : 'Deploy Inventory Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceForm;