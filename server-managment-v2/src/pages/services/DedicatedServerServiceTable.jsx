import React, { useMemo, useState } from "react";
import { Search, Calendar, ArrowRight, X, ChevronLeft, ChevronRight, Edit, Trash2, Download } from "lucide-react";
import { datacenters, serviceStatus, getStatusBadgeClass } from "./useCommonHooks";

export default function DedicatedServiceTable({ services, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDatacenter, setFilterDatacenter] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const targetQuery = search.toLowerCase();
      const matchSearch = !search || Object.values(s).some(v => v && String(v).toLowerCase().includes(targetQuery));
      const matchStatus = !filterStatus || s.status === filterStatus;
      const matchDatacenter = !filterDatacenter || s.datacenter === filterDatacenter;

      let matchDateRange = true;
      if (filterStartDate || filterEndDate) {
        const start = filterStartDate ? new Date(filterStartDate) : null;
        const end = filterEndDate ? new Date(filterEndDate) : null;
        const actDate = s.activationDate ? new Date(s.activationDate) : null;
        const discDate = s.discontinueDate ? new Date(s.discontinueDate) : null;
        const isActInRange = actDate && (!start || actDate >= start) && (!end || actDate <= end);
        const isDiscInRange = discDate && (!start || discDate >= start) && (!end || discDate <= end);
        matchDateRange = isActInRange || isDiscInRange;
      }
      return matchSearch && matchStatus && matchDatacenter && matchDateRange;
    });
  }, [services, search, filterStatus, filterDatacenter, filterStartDate, filterEndDate]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    const headers = ["Customer", "Server ID", "Model", "Rack Location", "Status", "Primary IP", "Datacenter"];
    const rows = filtered.map(s => [s.customer, s.serverId, s.hardwareModel, s.rackLocation, s.status, s.ip, s.datacenter]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(v => `"${v || ""}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `dedicated_hardware_catalog_${Date.now()}.csv`;
    link.click();
    setExportOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <Search size={16} className="text-gray-400 shrink-0 mr-2" />
            <input className="w-full py-2 text-sm bg-transparent outline-none placeholder-gray-400" placeholder="Search physical nodes..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {serviceStatus.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none" value={filterDatacenter} onChange={(e) => { setFilterDatacenter(e.target.value); setPage(1); }}>
            <option value="">All Datacenters</option>
            {datacenters.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="relative">
            <button onClick={() => setExportOpen(!exportOpen)} className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm font-medium h-10 px-4 rounded-lg shadow-sm hover:bg-gray-50">
              <Download size={16} /> Export View
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">CSV File</button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider"><Calendar size={14} /> Lifecycles:</div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2.5 py-1 bg-white">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Start:</span>
            <input type="date" className="text-xs outline-none bg-transparent" value={filterStartDate} onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }} />
            {filterStartDate && <X size={12} className="text-gray-400 cursor-pointer" onClick={() => setFilterStartDate("")} />}
          </div>
          <ArrowRight size={14} className="text-gray-300" />
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2.5 py-1 bg-white">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">End:</span>
            <input type="date" className="text-xs outline-none bg-transparent" value={filterEndDate} onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }} />
            {filterEndDate && <X size={12} className="text-gray-400 cursor-pointer" onClick={() => setFilterEndDate("")} />}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Hardware Identifier / Asset</th>
                <th className="p-4">Chassis Model</th>
                <th className="p-4">Rack Matrix Mapping</th>
                <th className="p-4">Primary IP</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginated.length > 0 ? (
                paginated.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{s.customer || "—"}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{s.serverId || "Bare-Metal Asset"}</div>
                      {s.erpID && <span className="text-[10px] font-mono font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded px-1">{s.erpID}</span>}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{s.hardwareModel || "—"}</td>
                    <td className="p-4 text-xs">
                      <div className="font-semibold text-gray-900">{s.datacenter}</div>
                      <div className="text-gray-500">{s.rackLocation} • Position {s.rackPosition || "—"}</div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-gray-900">{s.ip || "—"}</td>
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
                <tr><td colSpan="7" className="p-8 text-center text-gray-400 bg-gray-50/30">No bare-metal configurations match selection rules.</td></tr>
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