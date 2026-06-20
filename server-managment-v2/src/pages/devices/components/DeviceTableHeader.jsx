import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  FileSpreadsheet,
  FileText,
  Download,
  Plus,
} from 'lucide-react';

const DeviceTableHeader = ({ onDownloadCSV, onDownloadExcel, onDownloadPDF }) => {
  const navigate = useNavigate();

  return (
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
          onClick={onDownloadCSV}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition shadow-sm"
        >
          <Download size={18} />
          CSV
        </button>

        {/* EXCEL */}
        <button
          onClick={onDownloadExcel}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-green-700 transition shadow-sm"
        >
          <FileSpreadsheet size={18} />
          Excel
        </button>

        {/* PDF */}
        <button
          onClick={onDownloadPDF}
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
  );
};

export default DeviceTableHeader;
