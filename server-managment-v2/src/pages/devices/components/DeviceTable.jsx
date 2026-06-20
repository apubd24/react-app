import React from 'react';
import { Loader2 } from 'lucide-react';
import DeviceTableRow from './DeviceTableRow';

function DeviceTable({
  isLoading, currentDevices, onToggleStatus, onDelete,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {isLoading ? (
        <div className="p-14 text-center">
          <Loader2
            className="animate-spin mx-auto text-indigo-600 mb-2"
            size={28} />
          <p className="text-slate-500">
            Loading devices...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">UID</th>
                <th className="p-4 text-left">Customer Name</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Serial</th>
                <th className="p-4 text-left">Vendor</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Hardware Model</th>
                <th className="p-4 text-left">Device Type</th>
                <th className="p-4 text-left">Height</th>
                <th className="p-4 text-left">Asset Status</th>
                <th className="p-4 text-left">Data Center</th>
                <th className="p-4 text-left">RACK</th>
                <th className="p-4 text-left">Position</th>
                {/* <th className="p-4 text-left">Store</th> */}
                <th className="p-4 text-left">IP Address</th>
                {/* <th className="p-4 text-left">Community</th>
                <th className="p-4 text-left">SNMP(v)</th> */}
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentDevices.map((device) => (
                <DeviceTableRow
                  key={device.id}
                  device={device}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DeviceTable;
