import React, { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Edit, Trash2, Download } from "lucide-react";
import { serviceStatus, getStatusBadgeClass } from "./useCommonHooks";

export default function SSLCertificateTable({ services, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const targetQuery = search.toLowerCase();
      const matchSearch = !search || Object.values(s).some(v => v && String(v).toLowerCase().includes(targetQuery));
      const matchStatus = !filterStatus || s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [services, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    const headers = ["Customer", "Domain", "Certificate Type", "Expiry Date", "Status"];
    const rows = filtered.map(s => [s.customer, s.domain, s.certificateType, s.expiryDate, s.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(v => `"${v || ""}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `ssl_certificates_${Date.now()}.csv`;
    link.click();
    setExportOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <Search size={16} className="text-gray-400 shrink-0 mr-2" />
            <input className="w-full py-2 text-sm bg-transparent outline-none placeholder-gray-400" placeholder="Search certificates..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {serviceStatus.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative">
            <button onClick={() => setExportOpen(!exportOpen)} className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm font-medium h-10 px-4 rounded-lg shadow-sm hover:bg-gray-50">
              <Download size={16} /> Export Data
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">CSV Catalog</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Target Secured Domain</th>
                <th className="p-4">Certificate Authority Type</th>
                <th className="p-4">Expiration Boundary</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginated.length > 0 ? (
                paginated.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{s.customer || "—"}</td>
                    <td className="p-4 font-mono font-medium text-blue-600">{s.domain || "—"}</td>
                    <td className="p-4 text-gray-600">{s.certificateType || "Standard SSL"}</td>
                    <td className="p-4 font-mono text-xs text-gray-600">{s.expiryDate || "—"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusBadgeClass(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => onEdit(s)} className="p-1.5 text-amber-600 border border-transparent hover:border-amber-200 hover:bg-amber-50 rounded-md"><Edit size={15} /></button>
                        <button onClick={() => onDelete(s.id)} className="p-1.5 text-rose-600 border border-transparent hover:border-rose-200 hover:bg-rose-50 rounded-md"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 bg-gray-50/30">No active crypto-security properties found matching layout filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white text-xs text-gray-500 select-none">
          <div>Showing Page <span className="font-semibold text-gray-700">{page}</span> of <span className="font-semibold text-gray-700">{totalPages}</span></div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={15} /></button>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1.5 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}