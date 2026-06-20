import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export const useDeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // FETCH DEVICES AND CUSTOMERS SIMULTANEOUSLY ON MOUNT
  useEffect(() => {
    fetchDevicesAndCustomers();
  }, []);

  const fetchDevicesAndCustomers = async () => {
    setIsLoading(true);
    try {
      // Fetch both data streams concurrently to prevent blocking rendering delays
      const [devicesResponse, customersResponse] = await Promise.all([
        api.get('/api/devices'),
        api.get('/api/customers/dropdown').catch((err) => {
          console.error("Optional Customer matrix failed to resolve:", err);
          return { data: { data: [] } }; // Graceful fallback if customer API drops
        })
      ]);

      console.log('DEVICES API RESPONSE:', devicesResponse.data);
      console.log('CUSTOMERS API RESPONSE:', customersResponse.data);

      // Standardize incoming customer lookup arrays safely
      const customerPool = 
        customersResponse.data?.data || 
        (Array.isArray(customersResponse.data) ? customersResponse.data : []);

      // Standardize incoming device arrays safely
      const rawDevices =
        devicesResponse.data.devices ||
        devicesResponse.data.data ||
        [];

      // Map device objects and dynamically stitch in matching customer company text profiles
      const formattedDevices = rawDevices.map((d) => {
        const targetId = d.customer_id || d.CustomerID;
        
        // Match client structure references dynamically using the lookup pool
        const matchedCustomer = customerPool.find(
          (c) => String(c.id) === String(targetId)
        );

        // Fallback checks: Use found company_name, fallback to raw structural inputs, or empty string
        const computedCustomerName = matchedCustomer 
          ? (matchedCustomer.company_name || matchedCustomer.name)
          : (d.customer_name || d.CustomerName || `ID Reference: #${targetId || 'None'}`);

        return {
          id: d.device_id || d.DeviceID,
          item_id: d.item_id || d.ItemID,
          name: d.name || '',
          serial: d.serial || '',
          description: d.description || '',
          customerId: targetId || '',
          customerName: computedCustomerName, // Seamlessly bound matching runtime data column
          deviceName: d.device_name || d.DeviceName,
          vendor: d.device_vendor || d.DeviceVendor,
          category: d.device_category || d.DeviceCategory,
          hardwareModel: d.hardware_model || d.HardwareModel,
          deviceType: d.device_type || d.DeviceType,
          hardware_height: d.hardware_height || d.HardwareHeight,
          asset_status: d.asset_status || d.AssetStatus,
          datacenter_name: d.datacenter_name || d.DatacenterName,
          rack_name: d.rack_name || d.RackName,
          rack_position: d.rack_position || d.RackPosition,
          team_store_location: d.team_store_location || d.TeamStoreLocation,
          ipAddress: d.ip_address || d.IpAddress,
          snmpCommunity: d.snmp_community || d.SnmpCommunity,
          snmpVersion: d.snmp_version || d.SnmpVersion,
          status:
            d.is_active || d.IsActive
              ? 'online'
              : 'disabled',
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        };
      });

      setDevices(formattedDevices);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load system infrastructure datasets');
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE DEVICE
  const handleDeleteDevice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      await api.delete(`/api/devices/${id}`);
      setDevices(devices.filter((d) => d.id !== id));
      toast.success('Device deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete device');
    }
  };

  // STATUS UPDATE
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'disabled';

    try {
      await api.patch(`/api/devices/${id}/status`, {
        is_active: newStatus,
      });

      setDevices(
        devices.map((d) =>
          d.id === id
            ? {
                ...d,
                status: newStatus ? 'online' : 'disabled',
              }
            : d
        )
      );

      toast.success('Status updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  return {
    devices,
    isLoading,
    handleDeleteDevice,
    handleToggleStatus,
    refreshDevices: fetchDevicesAndCustomers // Expose reload trigger if layout views require manually syncing lists
  };
};













// import { useState, useEffect } from 'react';
// import api from '../../../services/api';
// import toast from 'react-hot-toast';

// export const useDeviceList = () => {
//   const [devices, setDevices] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // FETCH DEVICES
//   useEffect(() => {
//     fetchDevices();
//   }, []);

//   const fetchDevices = async () => {
//     setIsLoading(true);
//     try {
//       const response = await api.get('/api/devices');
//       console.log('API RESPONSE:', response.data);

//       const rawDevices =
//         response.data.devices ||
//         response.data.data ||
//         [];

//       const formattedDevices = rawDevices.map((d) => ({
//         id: d.device_id || d.DeviceID,
//         item_id: d.item_id || d.ItemID,
//         name: d.name || '',
//         serial: d.serial || '',
//         description: d.description || '',
//         customerId: d.customer_id || d.CustomerID,
//         customerName: d.customer_name || d.CustomerName,
//         deviceName: d.device_name || d.DeviceName,
//         vendor: d.device_vendor || d.DeviceVendor,
//         category: d.device_category || d.DeviceCategory,
//         hardwareModel: d.hardware_model || d.HardwareModel,
//         deviceType: d.device_type || d.DeviceType,
//         hardware_height: d.hardware_height || d.HardwareHeight,
//         asset_status: d.asset_status || d.AssetStatus,
//         datacenter_name: d.datacenter_name || d.DatacenterName,
//         rack_name: d.rack_name || d.RackName,
//         rack_position: d.rack_position || d.RackPosition,
//         team_store_location: d.team_store_location || d.TeamStoreLocation,
//         ipAddress: d.ip_address || d.IpAddress,
//         snmpCommunity: d.snmp_community || d.SnmpCommunity,
//         snmpVersion: d.snmp_version || d.SnmpVersion,
//         status:
//           d.is_active || d.IsActive
//             ? 'online'
//             : 'disabled',
//         createdAt: d.created_at,
//         updatedAt: d.updated_at,
//       }));

//       setDevices(formattedDevices);
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to load devices');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // DELETE DEVICE
//   const handleDeleteDevice = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this device?')) {
//       return;
//     }

//     try {
//       await api.delete(`/api/devices/${id}`);
//       setDevices(devices.filter((d) => d.id !== id));
//       toast.success('Device deleted successfully');
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to delete device');
//     }
//   };

//   // STATUS UPDATE
//   const handleToggleStatus = async (id, currentStatus) => {
//     const newStatus =
//       currentStatus === 'disabled'
//         ? true
//         : false;

//     try {
//       await api.patch(`/api/devices/${id}/status`, {
//         is_active: newStatus,
//       });

//       setDevices(
//         devices.map((d) =>
//           d.id === id
//             ? {
//                 ...d,
//                 status: newStatus
//                   ? 'online'
//                   : 'disabled',
//               }
//             : d
//         )
//       );

//       toast.success('Status updated');
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to update status');
//     }
//   };

//   return {
//     devices,
//     isLoading,
//     handleDeleteDevice,
//     handleToggleStatus,
//   };
// };
