import React, { useMemo, useState } from "react";
import { datacenters, virtualizationClusters, serviceType, serviceStatus, SSLCertificateTypes, getStatusBadgeClass } from "./useCommonHooks";
import { 
  Search, 
  Calendar, 
  ArrowRight, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Layers, 
  Server, 
  Globe, 
  ShieldAlert
} from "lucide-react";


/**
 * Resolves unique technical Identification token across disparate category modules
 */
function resolveServiceId(item) {
  if (item.serviceCategory === "VPS") return item.vpsid || "VPS-ASSET";
  if (item.serviceCategory === "Dedicated Server") return item.serverId || "HW-SERVER";
  if (item.serviceCategory === "SSL Certificate" || item.serviceCategory === "Domain") return item.domain || "WEB-ZONE";
  return "INFRA-ID";
}

/**
 * Renders Contextual UI Identifier Icons per Service Type Category
 */
function ServiceIcon({ category }) {
  switch (category) {
    case "VPS":
      return <Layers size={13} className="text-slate-500" />;
    case "Dedicated Server":
      return <Server size={13} className="text-blue-500" />;
    case "SSL Certificate":
      return <ShieldAlert size={13} className="text-emerald-500" />;
    case "Domain":
      return <Globe size={13} className="text-indigo-500" />;
    default:
      return <Layers size={13} className="text-gray-500" />;
  }
}

/**
 * =========================================================
 * GLOBAL SERVICE PAGE COMPONENT MODULE
 * =========================================================
 */
export default function GlobalServicePage({ services = [], onEdit, onDelete, openAdd }) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10; 

  /**
   * Generates a unique list of company/customer names from original dataset parameters
   */
  const companies = useMemo(() => {
    const list = services.map(s => s.customer).filter(Boolean);
    return [...new Set(list)].sort((a, b) => a.localeCompare(b));
  }, [services]);

  /**
   * Complete High-Fidelity Multi-Dimensional Filtering Matrix Runtime
   */
  const filtered = useMemo(() => {
    return services.filter((s) => {
      const targetQuery = search.toLowerCase();
      const matchSearch = !search || Object.values(s).some(v => v && String(v).toLowerCase().includes(targetQuery));
      const matchCategory = !filterCategory || s.serviceCategory === filterCategory;
      const matchStatus = !filterStatus || s.status === filterStatus;
      const matchCompany = !filterCompany || s.customer === filterCompany;

      let matchDateRange = true;
      if (filterStartDate || filterEndDate) {
        const start = filterStartDate ? new Date(filterStartDate + "T00:00:00") : null;
        const end = filterEndDate ? new Date(filterEndDate + "T23:59:59") : null;
        const actDate = s.activationDate ? new Date(s.activationDate) : null;
        const discDate = s.discontinueDate ? new Date(s.discontinueDate) : null;
        
        const isActInRange = actDate && (!start || actDate >= start) && (!end || actDate <= end);
        const isDiscInRange = discDate && (!start || discDate >= start) && (!end || discDate <= end);
        matchDateRange = isActInRange || isDiscInRange;
      }

      return matchSearch && matchCategory && matchStatus && matchCompany && matchDateRange;
    });
  }, [services, search, filterCategory, filterStatus, filterCompany, filterStartDate, filterEndDate]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Fallback structural adjustments if pages get stranded out of bounds
  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [filtered.length, totalPages, page]);

  /**
   * Safe Data Streaming Export Block using standard Client-side Blob Bloating
   */
  const exportCSV = () => {
    const headers = ["Customer Name", "Service Type", "ERP Reference ID", "Service Identifier", "Project Name", "Status", "Activation Date", "Discontinue Date"];
    const rows = filtered.map(s => [
      s.customer || "", 
      s.serviceCategory || "", 
      s.erpID || "", 
      resolveServiceId(s), 
      s.project || "", 
      s.status || "", 
      s.activationDate || "", 
      s.discontinueDate || ""
    ]);
    
    // Safely format elements to avoid breaks due to dynamic quotes/newlines
    const csvContent = [
      headers.join(","), 
      ...rows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `global_infrastructure_catalog_${Date.now()}.csv`;
    link.click();
    setExportOpen(false);
  };

  /**
   * Native Base XML Spreadsheet Engine (Generates direct Microsoft Excel native wrappers)
   */
  const exportExcel = () => {
    const headers = ["Customer Name", "Service Type", "ERP Reference ID", "Service Identifier", "Project Name", "Status", "Activation Date", "Discontinue Date"];
    const rows = filtered.map(s => [
      s.customer || "", 
      s.serviceCategory || "", 
      s.erpID || "", 
      resolveServiceId(s), 
      s.project || "", 
      s.status || "", 
      s.activationDate || "", 
      s.discontinueDate || ""
    ]);

    let xmlTemplate = `<?xml version="1.0"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        <Styles>
          <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>
        </Styles>
        <Worksheet ss:Name="Global Services Table">
          <Table>
            <Row ss:StyleID="Header">${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join("")}</Row>
            ${rows.map(r => `<Row>${r.map(v => `<Cell><Data ss:Type="String">${v}</Data></Cell>`).join("")}</Row>`).join("")}
          </Table>
        </Worksheet>
      </Workbook>`;

    const blob = new Blob([xmlTemplate], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `global_services_list_${Date.now()}.xls`;
    link.click();
    setExportOpen(false);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto p-2">
      
      {/* Search and Advanced Filters Workspace Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
          
          {/* Main Text Query Parser */}
          <div className="flex items-center border border-gray-200 rounded-lg px-3 bg-white h-10 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <Search size={16} className="text-gray-400 shrink-0 mr-2" />
            <input 
              className="w-full py-2 text-sm bg-transparent outline-none placeholder-gray-400" 
              placeholder="Search cross-platform nodes..." 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>

          {/* Company Filter Option Block */}
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none text-gray-700 font-medium h-10" value={filterCompany} onChange={(e) => { setFilterCompany(e.target.value); setPage(1); }}>
            <option value="">All Company</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Service Classification Selector */}
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none text-gray-700 font-medium h-10" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {serviceType.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Operational State Lifecycle Selector */}
          <select className="border border-gray-200 rounded-lg p-2 text-sm bg-white outline-none text-gray-700 font-medium h-10" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {serviceStatus.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Export & Asset Actions Selector Link wrapper */}
          <div className="flex items-center gap-2 print:hidden relative w-full md:justify-end">
            <div className="relative shrink-0">
              <button 
                onClick={() => setExportOpen(!exportOpen)} 
                className="inline-flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 text-sm font-medium h-10 px-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Download size={16} /> Export
              </button>
              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setExportOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-30 divide-y divide-gray-50">
                    <button onClick={exportExcel} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 font-medium transition-colors">Excel Spreadsheet</button>
                    <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 font-medium transition-colors">CSV System Matrix</button>
                    <button onClick={() => { window.print(); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 font-medium transition-colors">PDF Print Sheet</button>
                  </div>
                </>
              )}
            </div>
            
            {openAdd && (
              <button
                onClick={openAdd}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-10 px-3 rounded-lg transition-colors shadow-sm whitespace-nowrap grow text-center md:grow-0"
              >
                Add Asset
              </button>
            )}
          </div>

        </div>

        {/* Temporal Lifecycle Matrix Workspace */}
        <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider"><Calendar size={14} /> Lifecycles:</div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2.5 py-1 bg-white">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">Start Range:</span>
            <input type="date" className="text-xs outline-none bg-transparent font-medium text-gray-700" value={filterStartDate} onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }} />
            {filterStartDate && <X size={12} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => { setFilterStartDate(""); setPage(1); }} />}
          </div>
          <ArrowRight size={14} className="text-gray-300" />
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2.5 py-1 bg-white">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">End Range:</span>
            <input type="date" className="text-xs outline-none bg-transparent font-medium text-gray-700" value={filterEndDate} onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }} />
            {filterEndDate && <X size={12} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => { setFilterEndDate(""); setPage(1); }} />}
          </div>

          {/* Quick Context Clearer */}
          {(search || filterCategory || filterStatus || filterCompany || filterStartDate || filterEndDate) && (
            <button 
              onClick={() => {
                setSearch(""); setFilterCategory(""); setFilterStatus("");
                setFilterCompany(""); setFilterStartDate(""); setFilterEndDate(""); setPage(1);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 ml-auto flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-md px-2.5 py-1 transition-all"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Global Consolidated Architecture Matrix Component */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider print:bg-transparent">
                <th className="p-4 pl-5">Customer Name</th>
                <th className="p-4">Service Type</th>
                <th className="p-4">ERP ID</th>
                <th className="p-4">Service ID</th>
                <th className="p-4">Project Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginated.length > 0 ? (
                paginated.map((s, index) => (
                  <tr key={s.id || `row-${index}-${s.erpID || ''}`} className="hover:bg-gray-50/60 transition-colors print:hover:bg-transparent">
                    
                    {/* Column 1: Customer Corporate Name */}
                    <td className="p-4 pl-5 font-bold text-gray-900">{s.customer || "—"}</td>
                    
                    {/* Column 2: Combined Service Type Category Slot */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200/80">
                          <ServiceIcon category={s.serviceCategory} />
                          {s.serviceCategory || "Infrastructure Module"}
                        </span>
                      </div>
                    </td>

                    {/* Column 3: ERP ID Tag Framework */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        {s.erpID ? (
                          <span className="text-[10px] font-mono w-max font-semibold text-blue-700 bg-blue-50/80 border border-blue-100 rounded px-1.5 py-0.5">
                            {s.erpID}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-gray-400 italic">No ERP ID link</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Column 4: Dynamic Technical ID Asset Token */}
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold tracking-tight text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                        {resolveServiceId(s)}
                      </span>
                    </td>
                    
                    {/* Column 5: Architectural Infrastructure Project Block */}
                    <td className="p-4 text-gray-600 font-semibold">{s.project || "—"}</td>
                    
                    {/* Column 6: Status State Badge UI Wrapper */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${getStatusBadgeClass(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    
                    {/* Column 7: Activation Framework */}
                    <td className="p-4 text-xs font-medium text-gray-600">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wide text-emerald-600 w-8 inline-block">Act:</span>
                          <span className="font-mono text-gray-900">{s.activationDate || "—"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Column 8: Cessation Timeline Framework */}
                    <td className="p-4 text-xs font-medium text-gray-600">
                      <div className="space-y-0.5">
                        {(s.discontinueDate || s.status === "Inactive" || s.status === "Discontinued") ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wide text-rose-500 w-8 inline-block">Disc:</span>
                            <span className="font-mono text-rose-600 bg-rose-50 border border-rose-100/60 rounded px-0.5">{s.discontinueDate || "—"}</span>
                          </div>
                        ) : (
                          <span className="font-mono text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-gray-400 font-medium bg-gray-50/30">
                    No active infrastructure configurations matched your matrix query parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Consolidated Table Pagination Framework */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-white text-xs font-medium text-gray-500 select-none print:hidden">
          <div>Showing records <span className="font-bold text-gray-800">{filtered.length === 0 ? 0 : (page - 1) * perPage + 1}</span> to <span className="font-bold text-gray-800">{Math.min(filtered.length, page * perPage)}</span> of <span className="font-bold text-gray-800">{filtered.length}</span></div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(p => Math.max(p - 1, 1))} 
              disabled={page === 1} 
              className="p-1.5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-xs"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 font-semibold text-gray-700">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
              disabled={page === totalPages || filtered.length === 0} 
              className="p-1.5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-xs"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}