
import { useState } from 'react';

export const useDeviceFilters = (devices = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assetStatusFilter, setAssetStatusFilter] = useState('');
  const [dataCenterFilter, setDataCenterFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState(''); // FIX: Added missing customer state binding

  // FIX: Applied .filter(Boolean) to avoid saving 'undefined' elements into lookup maps
  const vendors = [...new Set(devices.map((d) => d.vendor))].filter(Boolean);
  const categories = [...new Set(devices.map((d) => d.category))].filter(Boolean);
  const dataCenters = [...new Set(devices.map((d) => d.datacenter_name))].filter(Boolean);
  const assetStatuses = [...new Set(devices.map((d) => d.asset_status))].filter(Boolean);

  // FIX: Generate valid unique customer object references mapping IDs to Names for your UI dropdown options
  const customers = Array.from(
    new Map(
      devices
        .filter((d) => d.customerId)
        .map((d) => [String(d.customerId), { id: String(d.customerId), company_name: d.customerName || `ID: ${d.customerId}` }])
    ).values()
  );

  // FILTER LOGIC MATRIX RUNTIME
  const filteredDevices = devices.filter((device) => {
    const keyword = searchTerm.toLowerCase();

    const matchSearch =
      device.deviceName?.toLowerCase().includes(keyword) ||
      device.name?.toLowerCase().includes(keyword) ||
      device.item_id?.toString().toLowerCase().includes(keyword) || // Matched item_id format from list hook
      device.ItemID?.toString().toLowerCase().includes(keyword) ||
      device.vendor?.toLowerCase().includes(keyword) ||
      device.category?.toLowerCase().includes(keyword) ||
      device.deviceType?.toLowerCase().includes(keyword) ||        // Matched deviceType safely
      device.type?.toLowerCase().includes(keyword) ||
      device.ipAddress?.toLowerCase().includes(keyword) ||
      device.serial?.toLowerCase().includes(keyword) ||
      device.asset_status?.toLowerCase().includes(keyword) ||
      device.team_store_location?.toLowerCase().includes(keyword) ||
      device.datacenter_name?.toLowerCase().includes(keyword) ||
      device.rack_name?.toLowerCase().includes(keyword) ||
      device.rack_position?.toString().toLowerCase().includes(keyword) ||
      device.description?.toLowerCase().includes(keyword) ||
      device.customerId?.toString().toLowerCase().includes(keyword) ||
      device.customerName?.toLowerCase().includes(keyword);

    const matchDataCenter =
      !dataCenterFilter ||
      device.datacenter_name === dataCenterFilter;

    const matchStatus =
      filterStatus === 'all' ||
      device.status === filterStatus;

    const matchVendor =
      !vendorFilter ||
      device.vendor === vendorFilter;

    const matchCategory =
      !categoryFilter ||
      device.category === categoryFilter;

    const matchAssetStatus =
      !assetStatusFilter ||
      device.asset_status === assetStatusFilter;

    // FIX: Match filter strings against record properties safely
    const matchCustomer = 
      !customerFilter || 
      String(device.customerId) === String(customerFilter);

    return (
      matchSearch &&
      matchStatus &&
      matchVendor &&
      matchCategory &&
      matchDataCenter &&
      matchAssetStatus &&
      matchCustomer
    );
  });

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    vendorFilter,
    setVendorFilter,
    categoryFilter,
    setCategoryFilter,
    dataCenterFilter,
    setDataCenterFilter,
    assetStatusFilter,
    setAssetStatusFilter,
    customerFilter,      // Exposed properties to wire into parent views
    setCustomerFilter,   // Exposed triggers to wire into parent views
    vendors,
    categories,
    dataCenters,
    assetStatuses,
    customers,           // Dynamic mapping pool sent smoothly back to UI elements
    filteredDevices,
  };
};


// import { useState, useEffect } from 'react';

// export const useDeviceFilters = (devices) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [vendorFilter, setVendorFilter] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('');
//   const [assetStatusFilter, setAssetStatusFilter] = useState('');
//   const [dataCenterFilter, setDataCenterFilter] = useState('');

//   // UNIQUE FILTERS
//   const vendors = [...new Set(devices.map((d) => d.vendor))];
//   const categories = [...new Set(devices.map((d) => d.category))];
//   const dataCenters = [...new Set(devices.map((d) => d.datacenter_name))];
//   const assetStatuses = [...new Set(devices.map((d) => d.asset_status))].filter(Boolean);
//   // FILTER
//   const filteredDevices = devices.filter((device) => {
//     const keyword = searchTerm.toLowerCase();

//     const matchSearch =
//       device.deviceName?.toLowerCase().includes(keyword) ||
//       device.name?.toLowerCase().includes(keyword) ||
//       device.ItemID?.toString().toLowerCase().includes(keyword) ||
//       device.vendor?.toLowerCase().includes(keyword) ||
//       device.category?.toLowerCase().includes(keyword) ||
//       device.type?.toLowerCase().includes(keyword) ||
//       device.ipAddress?.toLowerCase().includes(keyword) ||
//       device.serial?.toLowerCase().includes(keyword) ||
//       device.asset_status?.toLowerCase().includes(keyword) ||
//       device.team_store_location?.toLowerCase().includes(keyword) ||
//       device.datacenter_name?.toLowerCase().includes(keyword) ||
//       device.rack_name?.toLowerCase().includes(keyword) ||
//       device.rack_position?.toString().toLowerCase().includes(keyword) ||
//       device.description?.toLowerCase().includes(keyword) ||
//       device.customerId?.toString().toLowerCase().includes(keyword) ||
//       device.serial?.toLowerCase().includes(keyword) ||
//       device.customerName?.toLowerCase().includes(keyword);

//     const matchDataCenter =
//       !dataCenterFilter ||
//       device.datacenter_name === dataCenterFilter;

//     const matchStatus =
//       filterStatus === 'all' ||
//       device.status === filterStatus;

//     const matchVendor =
//       !vendorFilter ||
//       device.vendor === vendorFilter;

//     const matchCategory =
//       !categoryFilter ||
//       device.category === categoryFilter;

//     const matchAssetStatus =
//       !assetStatusFilter ||
//       device.asset_status === assetStatusFilter;

//     return (
//       matchSearch &&
//       matchStatus &&
//       matchVendor &&
//       matchCategory &&
//       matchDataCenter &&
//       matchAssetStatus
//     );
//   });

//   return {
//     searchTerm,
//     setSearchTerm,
//     filterStatus,
//     setFilterStatus,
//     vendorFilter,
//     setVendorFilter,
//     categoryFilter,
//     setCategoryFilter,
//     dataCenterFilter,
//     setDataCenterFilter,
//     assetStatusFilter,
//     setAssetStatusFilter,
//     vendors,
//     categories,
//     dataCenters,
//     assetStatuses,
//     filteredDevices,
//   };
// };
