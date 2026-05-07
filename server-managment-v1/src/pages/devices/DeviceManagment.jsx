import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Search,
  Plus,
  Edit,
  Trash2,
  Wifi,
  WifiOff,
  Ban,
  Loader2,
  Eye,
  FileSpreadsheet,
  FileText,
  Download
} from 'lucide-react';

import { motion } from 'motion/react';
import api from '../../services/api';
import toast from 'react-hot-toast';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DeviceList = () => {

  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [vendorFilter, setVendorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const navigate = useNavigate();

  // FETCH DEVICES
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {

    setIsLoading(true);

    try {

      const response = await api.get('/api/devices');

      console.log('API RESPONSE:', response.data);

      const rawDevices =
        response.data.devices ||
        response.data.data ||
        [];

      const formattedDevices = rawDevices.map((d) => ({

        id:
          d.device_id ||
          d.DeviceID,

        name:
          d.name ||
          '',

        serial:
          d.serial ||
          '',

        description:
          d.description ||
          '',

        customerId:
          d.customer_id ||
          d.CustomerID,

        customerName:
          d.customer_name ||
          d.CustomerName,

        deviceName:
          d.device_name ||
          d.DeviceName,

        vendor:
          d.device_vendor ||
          d.DeviceVendor,

        category:
          d.device_category ||
          d.DeviceCategory,

        type:
          d.device_type ||
          d.DeviceType,

        ipAddress:
          d.ip_address ||
          d.IpAddress,

        snmpCommunity:
          d.snmp_community ||
          d.SnmpCommunity,

        snmpVersion:
          d.snmp_version ||
          d.SnmpVersion,

        status:
          d.is_active || d.IsActive
            ? 'online'
            : 'disabled',

        createdAt:
          d.created_at,

        updatedAt:
          d.updated_at,
      }));

      setDevices(formattedDevices);

    } catch (error) {

      console.error(error);

      toast.error('Failed to load devices');

    } finally {

      setIsLoading(false);

    }
  };

  // UNIQUE FILTERS
  const vendors = [...new Set(devices.map((d) => d.vendor))];

  const categories = [...new Set(devices.map((d) => d.category))];

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

    const newStatus =
      currentStatus === 'disabled'
        ? true
        : false;

    try {

      await api.patch(`/api/devices/${id}/status`, {
        is_active: newStatus,
      });

      setDevices(
        devices.map((d) =>
          d.id === id
            ? {
                ...d,
                status: newStatus
                  ? 'online'
                  : 'disabled',
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

  // FILTER
  const filteredDevices = devices.filter((device) => {

    const keyword = searchTerm.toLowerCase();

    const matchSearch =
      device.deviceName?.toLowerCase().includes(keyword) ||
      device.vendor?.toLowerCase().includes(keyword) ||
      device.category?.toLowerCase().includes(keyword) ||
      device.type?.toLowerCase().includes(keyword) ||
      device.ipAddress?.toLowerCase().includes(keyword) ||
      device.customerName?.toLowerCase().includes(keyword);

    const matchStatus =
      filterStatus === 'all' ||
      device.status === filterStatus;

    const matchVendor =
      !vendorFilter ||
      device.vendor === vendorFilter;

    const matchCategory =
      !categoryFilter ||
      device.category === categoryFilter;

    return (
      matchSearch &&
      matchStatus &&
      matchVendor &&
      matchCategory
    );
  });

  // PAGINATION
  const indexOfLastRow = currentPage * rowsPerPage;

  const indexOfFirstRow =
    indexOfLastRow - rowsPerPage;

  const currentDevices = filteredDevices.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const totalPages = Math.ceil(
    filteredDevices.length / rowsPerPage
  );

  // RESET PAGE
  useEffect(() => {

    setCurrentPage(1);

  }, [
    searchTerm,
    filterStatus,
    vendorFilter,
    categoryFilter,
  ]);

  // CSV DOWNLOAD
  const downloadCSV = () => {

    const headers = [
      'ID',
      'Device Name',
      'Vendor',
      'Category',
      'Type',
      'IP Address',
      'SNMP',
      'Status',
    ];

    const rows = filteredDevices.map((d) => [
      d.id,
      d.deviceName,
      d.vendor,
      d.category,
      d.type,
      d.ipAddress,
      d.snmpVersion,
      d.status,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((e) => e.join(','))
      .join('\n');

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.setAttribute(
      'download',
      'devices.csv'
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    toast.success('CSV downloaded');
  };

  // EXCEL DOWNLOAD
  const downloadExcel = () => {

    const worksheet = XLSX.utils.json_to_sheet(
      filteredDevices
    );

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Devices'
    );

    XLSX.writeFile(
      workbook,
      'devices.xlsx'
    );

    toast.success('Excel downloaded');
  };

  // PDF DOWNLOAD
  const downloadPDF = () => {

    const doc = new jsPDF();

    doc.text('Device Inventory Report', 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [[
        'ID',
        'Device',
        'Vendor',
        'Category',
        'Type',
        'IP',
        'Status',
      ]],
      body: filteredDevices.map((d) => [
        d.id,
        d.deviceName,
        d.vendor,
        d.category,
        d.type,
        d.ipAddress,
        d.status,
      ]),
    });

    doc.save('devices.pdf');

    toast.success('PDF downloaded');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-slate-900 flex items-center">

            <Smartphone
              className="mr-3 text-indigo-600"
              size={26}
            />

            Device Inventory

          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage all the devices in one place
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* CSV */}
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition shadow-sm"
          >
            <Download size={18} />
            CSV
          </button>

          {/* EXCEL */}
          <button
            onClick={downloadExcel}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-green-700 transition shadow-sm"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

          {/* PDF */}
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition shadow-sm"
          >
            <FileText size={18} />
            PDF
          </button>

          {/* ADD DEVICE */}
          <button
            onClick={() => navigate('/devices/add')}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus size={18} />
            Add Device
          </button>

        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 shadow-sm">

        {/* SEARCH */}
        <div className="relative flex-1">

          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />

          <input
            type="text"
            placeholder="Search by name or IP..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          />

        </div>

        {/* STATUS */}
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value)
          }
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
        >
          <option value="all">
            All Status
          </option>

          <option value="online">
            Online
          </option>

          <option value="disabled">
            Disabled
          </option>

        </select>

        {/* VENDOR */}
        <select
          value={vendorFilter}
          onChange={(e) =>
            setVendorFilter(e.target.value)
          }
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
        >
          <option value="">
            All Vendors
          </option>

          {vendors.map((v) => (
            <option
              key={v}
              value={v}
            >
              {v}
            </option>
          ))}

        </select>

        {/* CATEGORY */}
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
        >
          <option value="">
            All Category
          </option>

          {categories.map((c) => (
            <option
              key={c}
              value={c}
            >
              {c}
            </option>
          ))}

        </select>

      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

        {isLoading ? (

          <div className="p-12 text-center">

            <Loader2
              className="animate-spin mx-auto text-indigo-600 mb-2"
              size={28}
            />

            <p className="text-slate-500">
              Loading devices...
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">

                <tr>

                  <th className="p-4 text-left">
                    ID
                  </th>

                  <th className="p-4 text-left">
                    Device Name
                  </th>

                  <th className="p-4 text-left">
                    Vendor
                  </th>

                  <th className="p-4 text-left">
                    Category
                  </th>

                  <th className="p-4 text-left">
                    Type
                  </th>

                  <th className="p-4 text-left">
                    IP Address
                  </th>

                  <th className="p-4 text-left">
                    Community
                  </th>

                  <th className="p-4 text-left">
                    SNMP(v)
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {currentDevices.map((device) => (

                  <motion.tr
                    key={device.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="p-4">
                      {device.id}
                    </td>

                    <td className="p-4">
                      {device.deviceName}
                    </td>

                    <td className="p-4">
                      {device.vendor}
                    </td>

                    <td className="p-4">
                      {device.category}
                    </td>

                    <td className="p-4">
                      {device.type}
                    </td>

                    <td className="p-4">
                      {device.ipAddress}
                    </td>

                    <td className="p-4">
                      {device.snmpCommunity}
                    </td>

                    <td className="p-4">
                      {device.snmpVersion}
                    </td>

                    {/* STATUS */}
                    <td className="p-4">

                      <button
                        onClick={() =>
                          handleToggleStatus(
                            device.id,
                            device.status
                          )
                        }
                        className="flex items-center gap-2"
                      >

                        {device.status === 'online' && (
                          <Wifi
                            size={14}
                            className="text-green-600"
                          />
                        )}

                        {device.status === 'offline' && (
                          <WifiOff
                            size={14}
                            className="text-yellow-600"
                          />
                        )}

                        {device.status === 'disabled' && (
                          <Ban
                            size={14}
                            className="text-slate-500"
                          />
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
                          onClick={() =>
                            handleDeleteDevice(device.id)
                          }
                          className="text-slate-500 hover:text-red-600 transition"
                          title="Delete Device"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </motion.tr>

                ))}

              </tbody>

            </table>

            {/* PAGINATION */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 border-t">

              {/* INFO */}
              <div className="text-xs text-slate-500">

                Showing {indexOfFirstRow + 1} -{' '}
                {Math.min(
                  indexOfLastRow,
                  filteredDevices.length
                )}{' '}
                of {filteredDevices.length}

              </div>

              {/* CONTROLS */}
              <div className="flex items-center gap-2">

                {/* ROWS */}
                <select
                  value={rowsPerPage}
                  onChange={(e) =>
                    setRowsPerPage(
                      Number(e.target.value)
                    )
                  }
                  className="px-2 py-1 text-xs border rounded-lg bg-slate-50"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size}/page
                    </option>
                  ))}
                </select>

                {/* PREV */}
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.max(p - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border rounded-lg disabled:opacity-50"
                >
                  Prev
                </button>

                {/* PAGE */}
                {[...Array(totalPages)]
                  .slice(0, 5)
                  .map((_, i) => {

                    const page = i + 1;

                    return (
                      <button
                        key={page}
                        onClick={() =>
                          setCurrentPage(page)
                        }
                        className={`px-2 py-1 text-xs rounded-lg border ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                {/* NEXT */}
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(
                        p + 1,
                        totalPages
                      )
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  className="px-2 py-1 text-xs border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default DeviceList;

