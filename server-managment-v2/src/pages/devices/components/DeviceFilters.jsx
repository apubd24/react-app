import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const DeviceFilters = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  dataCenterFilter,
  onDataCenterChange,
  vendorFilter,
  onVendorChange,
  categoryFilter,
  onCategoryChange,
  assetStatusFilter,
  onAssetStatusChange,
  customerFilter,       // Added to support filtering by customer account
  onCustomerChange,     // Added to support filtering by customer account
  vendors = [],         // Safe empty array fallbacks to prevent crashes
  categories = [],
  dataCenters = [],
  assetStatuses = [],
  customers = []        // Added to support your customer lookup pool
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 shadow-sm items-center w-full">
      
      {/* SEARCH FIELD */}
      <div className="relative w-full xl:flex-1 group">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by name, serial, or IP..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm"
        />
      </div>

      {/* FILTER CONTROLS GRID */}
      {/* Changes layout spacing cleanly using grid columns to prevent layout squeezing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:flex xl:flex-wrap items-center gap-3 w-full xl:w-auto">
        {/* ASSET STATUS */}
        <select
          value={assetStatusFilter}
          onChange={(e) => onAssetStatusChange(e.target.value)}
          className="w-full xl:w-40 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm cursor-pointer"
        >
          <option value="">Asset Status</option>
          {assetStatuses.map((as) => {
            const val = typeof as === 'object' ? (as.name || as.id) : as;
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>
        
        {/* DYNAMIC CUSTOMER FILTER LINK */}
        {onCustomerChange && (
          <select
            value={customerFilter}
            onChange={(e) => onCustomerChange(e.target.value)}
            className="w-full xl:w-48 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm cursor-pointer"
          >
            <option value="">Customers</option>
            {customers.map((cust) => {
              // Structural validation: Safely maps objects even if they come from the API payload hook directly
              const id = cust.id || cust.customer_id;
              const name = cust.company_name || cust.name;
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </select>
        )}

        {/* VENDORS */}
        <select
          value={vendorFilter}
          onChange={(e) => onVendorChange(e.target.value)}
          className="w-full xl:w-40 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm cursor-pointer"
        >
          <option value="">Vendors</option>
          {vendors.map((v) => {
            const val = typeof v === 'object' ? (v.name || v.id) : v;
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>

        {/* CATEGORIES */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full xl:w-40 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm cursor-pointer"
        >
          <option value="">Categories</option>
          {categories.map((c) => {
            const val = typeof c === 'object' ? (c.name || c.id) : c;
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>

        {/* DATACENTER */}
        <select
          value={dataCenterFilter}
          onChange={(e) => onDataCenterChange(e.target.value)}
          className="w-full xl:w-44 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm cursor-pointer"
        >
          <option value="">Data Centers</option>
          {dataCenters.map((dc) => {
            const val = typeof dc === 'object' ? (dc.name || dc.id) : dc;
            return <option key={val} value={val}>{val}</option>;
          })}
        </select>

        {/* SNMP POLLING STATUS */}
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full xl:w-40 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all shadow-sm cursor-pointer"
        >
          <option value="all">SNMP Polling States</option>
          <option value="online">Online Only</option>
          <option value="disabled">Disabled Only</option>
        </select>
      </div>
    </div>
  );
};

export default DeviceFilters;