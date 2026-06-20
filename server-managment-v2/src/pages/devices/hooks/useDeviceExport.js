import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const useDeviceExport = () => {
  // CSV DOWNLOAD
  const downloadCSV = (filteredDevices) => {
    const headers = [
      'ID',
      'Customer Name',
      'Device Name',
      'Serial"',
      'Vendor',
      'Category',
      'Hardware Model',
      'Device Type',
      'Height',
      'Asset Status',
      'Datacenter Name',
      'Rack Name',
      'Rack Position',
      'IP Address',
      'SNMP',
      'Status',
    ];

    const rows = filteredDevices.map((d) => [
      d.id,
      d.customerName,
      d.deviceName,
      d.serial,
      d.vendor,
      d.category,
      d.hardwareModel,
      d.deviceType,
      d.hardware_height,
      d.asset_status,
      d.datacenter_name,
      d.rack_name,
      d.rack_position,
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
    link.setAttribute('download', 'devices.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV downloaded');
  };

  // EXCEL DOWNLOAD
  const downloadExcel = (filteredDevices) => {
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
  const downloadPDF = (filteredDevices) => {
    const doc = new jsPDF();

    doc.text('Device Inventory Report', 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [[
        'ID',
        `Customer Name`,
        'Device',
        'Serial',
        'Vendor',
        'Category',
        'Hardware Model',
        'Height',
        'Device Type',
        'Asset Status',
        'Datacenter Name',
        'Rack Name',
        'Rack Position',
        'IP',
        'Status',
      ]],
      body: filteredDevices.map((d) => [
        d.id,
        d.customerName,
        d.deviceName,
        d.serial,
        d.vendor,
        d.category,
        d.hardwareModel,
        d.hardware_height,
        d.deviceType,
        d.asset_status,
        d.datacenter_name,
        d.rack_name,
        d.rack_position,
        d.ipAddress,
        d.status,
      ]),
    });

    doc.save('devices.pdf');
    toast.success('PDF downloaded');
  };

  return {
    downloadCSV,
    downloadExcel,
    downloadPDF,
  };
};
