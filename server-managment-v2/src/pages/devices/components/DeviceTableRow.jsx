import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Wifi,
  WifiOff,
  Ban,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

const DeviceTableRow = ({
  device,
  onToggleStatus,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <motion.tr className="hover:bg-slate-50">
      <td className="p-4">{device.id}</td>
      <td className="p-4">{device.item_id}</td>
      <td className="p-4">{device.customerName}</td>
      <td className="p-4">{device.name}</td>
      <td className="p-4">{device.serial}</td>
      <td className="p-4">{device.vendor}</td>
      <td className="p-4">{device.category}</td>
      <td className="p-4">{device.hardwareModel}</td>
      <td className="p-4">{device.deviceType}</td>
      <td className="p-4">{device.hardware_height}</td>
      <td className="p-4">{device.asset_status}</td>
      <td className="p-4">{device.datacenter_name}</td>
      <td className="p-4">{device.rack_name}</td>
      <td className="p-4">{device.rack_position}</td>
      {/* <td className="p-4">{device.team_store_location}</td> */}
      <td className="p-4">{device.ipAddress}</td>
      {/* <td className="p-4">{device.snmpCommunity}</td>
      <td className="p-4">{device.snmpVersion}</td> */}

      {/* STATUS */}
      <td className="p-4">
        <button
          onClick={() =>
            onToggleStatus(device.id, device.status)
          }
          className="flex items-center gap-2"
        >
          {device.status === 'online' && (
            <Wifi size={14} className="text-green-600" />
          )}
          {device.status === 'offline' && (
            <WifiOff size={14} className="text-yellow-600" />
          )}
          {device.status === 'disabled' && (
            <Ban size={14} className="text-slate-500" />
          )}
          <span className="capitalize text-xs font-semibold text-slate-700">
            {device.status}
          </span>
        </button>
      </td>

      {/* ACTIONS */}
      <td className="p-4">
        <div className="flex items-center justify-end gap-3">
          {/* VIEW */}
          <button
            onClick={() =>
              navigate(`/devices/view/${device.id}`)
            }
            className="text-slate-500 hover:text-indigo-600 transition"
            title="View Device"
          >
            <Eye size={17} />
          </button>

          {/* EDIT */}
          <button
            onClick={() =>
              navigate(`/devices/edit/${device.id}`)
            }
            className="text-slate-500 hover:text-blue-600 transition"
            title="Edit Device"
          >
            <Edit size={17} />
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete(device.id)}
            className="text-slate-500 hover:text-red-600 transition"
            title="Delete Device"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default DeviceTableRow;