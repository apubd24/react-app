import React, { useMemo, useState } from "react";
import { Search, Calendar, ArrowRight, X, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Download } from "lucide-react";
import { datacenters, virtualizationClusters, serviceStatus, getStatusBadgeClass } from "./useCommonHooks";

export default function VPSServiceTable({ services, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCluster, setFilterCluster] = useState("");
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
      const matchCluster = !filterCluster || s.cluster === filterCluster;
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
      return matchSearch && matchStatus && matchCluster && matchDatacenter && matchDateRange;
    });
  }, [services, search, filterStatus, filterCluster, filterDatacenter, filterStartDate, filterEndDate]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    const headers = ["Customer", "ERP ID", "Project", "VPS ID", "Status", "IP Address", "Cluster", "Datacenter"];
    const rows = filtered.map(s => [s.customer, s.erpID, s.project, s.vpsid, s.status, s.ip, s.cluster, s.datacenter]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(v => `"${v || ""}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `vps_catalog_${Date.now()}.csv`;
    link.click();
    setExportOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Actions Workspace */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <Search size={16} className="text-gray-400 shrink-0 mr-2" />
            <input className="w-full py-2 text-sm bg-transparent outline-none placeholder-gray-400" placeholder="Search VPS records..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {serviceStatus.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none" value={filterCluster} onChange={(e) => { setFilterCluster(e.target.value); setPage(1); }}>
            <option value="">All Clusters</option>
            {virtualizationClusters.map(c => <option key={c} value={c}>{c}</option>)}
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
                <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">CSV Format</button>
                <button onClick={() => { window.print(); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">PDF / Print</button>
              </div>
            )}
          </div>
        </div>

        {/* Date Matrix Fields */}
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

      {/* Core Virtual Server Table Matrix */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Asset Details</th>
                <th className="p-4">Project</th>
                <th className="p-4">Networking Mapping</th>
                <th className="p-4">Status</th>
                <th className="p-4">Cluster / DC</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginated.length > 0 ? (
                paginated.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{s.customer || "—"}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center w-max px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">{s.vpsid || "VPS Asset"}</span>
                        {s.erpID && <span className="text-[10px] font-mono w-max font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded px-1">{s.erpID}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{s.project || "—"}</td>
                    <td className="p-4 font-mono text-[11px]">
                      <div className="text-gray-900">Pri: {s.ip || "—"} {s.primaryvlan && `(VLAN ${s.primaryvlan})`}</div>
                      {s.secondaryip && <div className="text-gray-500">Sec: {s.secondaryip} {s.secondaryvlan && `(VLAN ${s.secondaryvlan})`}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusBadgeClass(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="font-semibold text-gray-900">{s.cluster || "—"}</div>
                      <div className="text-gray-500">{s.datacenter || "—"}</div>
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
                <tr><td colSpan="7" className="p-8 text-center text-gray-400 bg-gray-50/30">No active VPS infrastructure configurations matched your query parameters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modular Grid Pagination controls */}
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