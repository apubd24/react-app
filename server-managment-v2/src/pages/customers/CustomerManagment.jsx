import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Loader2, Search, Building2, Globe,
  CheckCircle2, XCircle, Eye, X, MapPin, Mail, Phone,
  MessageCircle, Users, User, GitBranch, UserCheck, ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Define API_BASE if it's external, or fallback safely
const API_BASE = window.API_BASE || '';

// ─── Customer Detail Modal ────────────────────────────────────────

const CustomerViewModal = ({ customer, onClose }) => {
  if (!customer) return null;

  const InfoRow = ({ icon: Icon, label, value }) =>
    value ? (
      <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200">
        <div className="mt-1 p-2.5 rounded-lg bg-indigo-50 flex-shrink-0">
          <Icon size={16} className="text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm text-slate-800 font-medium leading-relaxed break-words">{value}</p>
        </div>
      </div>
    ) : null;

  const TagList = ({ icon: Icon, label, items }) => {
    const filtered = (items || []).filter(Boolean);
    if (!filtered.length) return null;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Icon size={14} className="text-indigo-600" />
          </div>
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</span>
          <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-bold">{filtered.length}</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {filtered.map((item, i) => (
            <span key={i} className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 text-sm rounded-lg font-medium border border-indigo-200 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-150 shadow-sm">{item}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-slate-200">

        {/* Hero Section - Company Profile Header */}
        <div className="relative h-40 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full"></div>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all duration-200 backdrop-blur-sm z-10"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <div className="relative h-full flex items-end px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-end gap-6 w-full">
              <div className="relative">
                {customer.company_logo ? (
                  <img
                    src={`${API_BASE}${customer.company_logo}`}
                    alt={customer.company_name}
                    className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-white flex items-center justify-center shadow-lg border-4 border-white">
                    <Building2 size={40} className="text-indigo-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 pb-1">
                <h2 className="text-3xl font-bold text-white mb-2">{customer.company_name || '—'}</h2>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm ${
                    customer.customer_status === 'active'
                      ? 'bg-emerald-400/90 text-white'
                      : 'bg-red-400/90 text-white'
                  }`}>
                    {customer.customer_status === 'active'
                      ? <><CheckCircle2 size={16} /> Active</>
                      : <><XCircle size={16} /> Inactive</>}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl">
                <Building2 size={20} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Company Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">General information and contact details</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InfoRow icon={Globe} label="Website" value={customer.website} />
              <InfoRow icon={MapPin} label="Office Address" value={customer.office_address} />
              <InfoRow icon={MessageCircle} label="Company Note" value={customer.customer_note} />
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* Account Manager */}
          {customer.account_manager_name && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl">
                    <UserCheck size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Account Manager</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Dedicated point of contact</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoRow icon={User} label="Full Name" value={customer.account_manager_name} />
                    <InfoRow icon={UserCheck} label="Designation" value={customer.account_manager_designation} />
                    <InfoRow icon={GitBranch} label="Branch" value={customer.account_manager_branch} />
                    <InfoRow icon={Mail} label="Email" value={customer.account_manager_email} />
                    <InfoRow icon={Phone} label="Contact Number" value={customer.account_manager_contact} />
                    <InfoRow icon={MessageCircle} label="WhatsApp" value={customer.account_manager_whatsapp} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200"></div>
            </>
          )}

          {/* Support / NOC */}
          {(customer.support_emails?.some(Boolean) ||
            customer.support_mobiles?.some(Boolean) ||
            customer.support_whatsapp_numbers?.some(Boolean) ||
            customer.support_whatsapp_groups?.some(Boolean)) && (
            <>
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl">
                    <ShieldCheck size={20} className="text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Support & NOC</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Technical support and network operations team</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TagList icon={Mail} label="Support Emails" items={customer.support_emails} />
                  <TagList icon={Phone} label="Support Numbers" items={customer.support_mobiles} />
                  <TagList icon={MessageCircle} label="WhatsApp Numbers" items={customer.support_whatsapp_numbers} />
                  <TagList icon={Users} label="WhatsApp Groups" items={customer.support_whatsapp_groups} />
                </div>
              </div>

              <div className="border-t border-slate-200"></div>
            </>
          )}

          {/* Contact Persons */}
          {customer.contact_persons?.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl">
                  <Users size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Contact Persons</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{customer.contact_persons.length} key contacts</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {customer.contact_persons.map((person, i) => (
                  <div key={i} className="border border-slate-300 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-md">
                          <User size={18} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-base">{person.name || '—'}</p>
                          <p className="text-emerald-100 text-sm">{person.designation || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-lg font-bold uppercase backdrop-blur-sm capitalize">
                          {person.contact_type}
                        </span>
                        <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-lg font-bold uppercase backdrop-blur-sm">
                          {person.contact_level}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <TagList icon={Mail} label="Email Addresses" items={person.emails} />
                      <TagList icon={Phone} label="Phone Numbers" items={person.mobiles} />
                      <TagList icon={MessageCircle} label="WhatsApp" items={person.whatsapps} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────

const CustomerManagment = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [isFetchingView, setIsFetchingView] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await api.get('/api/customers', { params });
      setCustomers(data.data || []);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/customers/${id}`);
      toast.success('Customer deleted');
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error('Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (id) => {
    setIsFetchingView(true);
    try {
      const { data } = await api.get(`/api/customers/${id}`);
      setViewingCustomer(data);
    } catch {
      toast.error('Failed to load customer details');
    } finally {
      setIsFetchingView(false);
    }
  };

  // ── Export helpers ─────────────────────────────────────────
  const buildFlatRows = (customersList) => {
    const rows = [];
    let lastCompanyId = null;
    let rowCountPerCompany = 0;

    customersList.forEach((c) => {
      const isNewCompany = c.id !== lastCompanyId;
      if (isNewCompany) {
        rowCountPerCompany = 0;
        lastCompanyId = c.id;
      }

      const baseRowWithCompanyInfo = {
        Company: c.company_name || '',
        Website: c.website ? String(c.website).replace(/^https?:\/\//, '') : '',
        'Account Manager Name': c.account_manager_name || '',
        'Account Manager Mobile': c.account_manager_contact || '',
        'Account Manager Email': c.account_manager_email || '',
        'Account Manager WhatsApp': c.account_manager_whatsapp || '',
        Status: c.customer_status || '',
      };

      const baseRowBlank = {
        Company: '',
        Website: '',
        'Account Manager Name': '',
        'Account Manager Mobile': '',
        'Account Manager Email': '',
        'Account Manager WhatsApp': '',
        Status: '',
      };

      // Gather support array elements
      const supportEmails = (c.support_emails || []).filter(Boolean);
      const supportNumbers = (c.support_mobiles || []).filter(Boolean);
      const supportWhatsApps = (c.support_whatsapp_numbers || []).filter(Boolean);
      const supportGroups = (c.support_whatsapp_groups || []).filter(Boolean);
      const maxSupportRows = Math.max(supportEmails.length, supportNumbers.length, supportWhatsApps.length, supportGroups.length);

      // Flatten contact persons data into consecutive list maps
      const flattenedContacts = [];
      const persons = c.contact_persons || [];
      persons.forEach((p) => {
        const emails = (p.emails || []).filter(Boolean);
        const mobiles = (p.mobiles || []).filter(Boolean);
        const whats = (p.whatsapps || []).filter(Boolean);
        const dynamicContactRows = Math.max(emails.length, mobiles.length, whats.length);
        const maxContactRows = dynamicContactRows > 0 ? dynamicContactRows : 1;

        for (let i = 0; i < maxContactRows; i++) {
          flattenedContacts.push({
            name: p.name || '',
            email: emails[i] || '',
            mobile: mobiles[i] || '',
            whatsapp: whats[i] || '',
          });
        }
      });

      // Unified layout calculation: prevents empty rows by merging on parallel line indices
      const maxCompanyRows = Math.max(1, maxSupportRows, flattenedContacts.length);

      for (let i = 0; i < maxCompanyRows; i++) {
        const row = rowCountPerCompany === 0 ? { ...baseRowWithCompanyInfo } : { ...baseRowBlank };
        
        // Map Support Columns directly to line index
        row['Support Emails'] = supportEmails[i] || '';
        row['Support Numbers'] = supportNumbers[i] || '';
        row['Support WhatsApps'] = supportWhatsApps[i] || '';
        row['Support WhatsApp Groups'] = supportGroups[i] || '';

        // Map Contact Columns synchronously to the exact same line index
        const currentContact = flattenedContacts[i];
        row['Contact Name'] = currentContact ? currentContact.name : '';
        row['Contact Email'] = currentContact ? currentContact.email : '';
        row['Contact Number'] = currentContact ? currentContact.mobile : '';
        row['Contact WhatsApp'] = currentContact ? currentContact.whatsapp : '';

        rows.push(row);
        rowCountPerCompany++;
      }
    });
    return rows;
  };

  const exportToExcel = (customersList) => {
    try {
      const data = buildFlatRows(customersList);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Customers');
      const colWidths = [15, 15, 20, 20, 20, 20, 10, 20, 20, 20, 24, 20, 20, 20, 20];
      ws['!cols'] = colWidths.map(w => ({ wch: w }));
      XLSX.writeFile(wb, `customers_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Excel');
    }
  };

  const exportToCSV = (customersList) => {
    try {
      const data = buildFlatRows(customersList);
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `customers_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV');
    }
  };

  const exportToPDF = (customersList) => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
      const data = buildFlatRows(customersList).map((r) => [
        r.Company,
        r.Website,
        r['Account Manager Name'],
        r['Account Manager Mobile'],
        r['Account Manager Email'],
        r['Account Manager WhatsApp'],
        r.Status,
        r['Support Emails'],
        r['Support Numbers'],
        r['Support WhatsApps'],
        r['Support WhatsApp Groups'],
        r['Contact Name'],
        r['Contact Email'],
        r['Contact Number'],
        r['Contact WhatsApp'],
      ]);

      const head = [[
        'Company','Website','AM Name','AM Mobile','AM Email','AM WhatsApp','Status',
        'Support Emails','Support Numbers','Support WhatsApps','Support Groups',
        'Contact Name','Contact Email','Contact Number','Contact WhatsApp',
      ]];

      doc.text('Customers List Export', 40, 40);
      doc.autoTable({
        head,
        body: data,
        startY: 60,
        styles: { fontSize: 6, overflow: 'linebreak', cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        theme: 'grid',
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 50 },
          2: { cellWidth: 50 },
          3: { cellWidth: 50 },
          4: { cellWidth: 55 },
          5: { cellWidth: 50 },
          6: { cellWidth: 35 },
          7: { cellWidth: 55 },
          8: { cellWidth: 50 },
          9: { cellWidth: 50 },
          10: { cellWidth: 50 },
          11: { cellWidth: 50 },
          12: { cellWidth: 55 },
          13: { cellWidth: 50 },
          14: { cellWidth: 50 },
        },
      });
      doc.save(`customers_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <>
      {/* View Modal */}
      {viewingCustomer && (
        <CustomerViewModal
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
        />
      )}

      {/* Fetching overlay for view */}
      {isFetchingView && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg px-5 py-4 flex items-center gap-3 shadow-lg border border-slate-200">
            <Loader2 size={18} className="animate-spin text-indigo-600" />
            <span className="text-xs font-medium text-slate-700">Loading customer details...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-100">
                <Building2 className="text-indigo-600" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Customers</h1>
                <p className="text-xs text-slate-500 mt-0.5">{customers.length} Total</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2">
                <button
                  onClick={() => exportToCSV(customers)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 shadow-sm"
                >CSV</button>
                <button
                  onClick={() => exportToExcel(customers)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 shadow-sm"
                >XLSX</button>
                <button
                  onClick={() => exportToPDF(customers)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 shadow-sm"
                >PDF</button>
              </div>

              <div className="inline-flex items-center">
                <button
                  onClick={() => navigate('/customers/add')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md transition-all duration-200 text-xs"
                >
                  <Plus size={16} /> Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, manager, email..."
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
              />
            </div>
            <select
              value={status} onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
              <Building2 size={40} className="text-slate-300" />
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs">Try adjusting your search or add a new customer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs table-auto">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-5 py-3 font-semibold text-slate-700">Company</th>
                    <th className="px-5 py-3 font-semibold text-slate-700">Support Emails</th>
                    <th className="px-5 py-3 font-semibold text-slate-700">Support Numbers</th>
                    {/* <th className="px-5 py-3 font-semibold text-slate-700">Support WhatsApps</th>
                    <th className="px-5 py-3 font-semibold text-slate-700">Support WhatsApp Groups</th> */}
                    <th className="px-5 py-3 font-semibold text-slate-700 hidden lg:table-cell">Account Manager</th>
                    <th className="px-5 py-3 font-semibold text-slate-700">Status</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {c.company_logo ? (
                            <img
                              src={`${API_BASE}${c.company_logo}`}
                              alt={c.company_name}
                              className="h-8 w-8 rounded-lg object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <Building2 size={16} className="text-indigo-600" />
                            </div>
                          )}
                          <span className="font-medium text-slate-700 text-sm">{c.company_name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 max-w-[150px] truncate" title={c.support_emails?.filter(Boolean).join(', ')}>
                        {c.support_emails?.filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600 max-w-[120px] truncate" title={c.support_mobiles?.filter(Boolean).join(', ')}>
                        {c.support_mobiles?.filter(Boolean).join(', ') || '—'}
                      </td>
                      {/* <td className="px-5 py-3 text-slate-600 max-w-[120px] truncate" title={c.support_whatsapp_numbers?.filter(Boolean).join(', ')}>
                        {c.support_whatsapp_numbers?.filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600 max-w-[150px] truncate" title={c.support_whatsapp_groups?.filter(Boolean).join(', ')}>
                        {c.support_whatsapp_groups?.filter(Boolean).join(', ') || '—'}
                      </td> */}
                      <td className="px-5 py-3 hidden lg:table-cell">
                        <p className="text-slate-700 font-medium text-sm">{c.account_manager_name || '—'}</p>
                        {c.account_manager_email && (
                          <p className="text-xs text-slate-400 mt-0.5">{c.account_manager_email}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {c.customer_status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(c.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-150 focus:ring-1 focus:ring-emerald-500"
                            title="View details"
                            aria-label={`View details for ${c.company_name}`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/customers/${c.id}/edit`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150 focus:ring-1 focus:ring-indigo-500"
                            title="Edit customer"
                            aria-label={`Edit ${c.company_name}`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.company_name)}
                            disabled={deletingId === c.id}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 disabled:opacity-50 focus:ring-1 focus:ring-red-500"
                            title="Delete customer"
                            aria-label={`Delete ${c.company_name}`}
                          >
                            {deletingId === c.id
                              ? <Loader2 size={16} className="animate-spin" />
                              : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerManagment;





// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Plus, Pencil, Trash2, Loader2, Search, Building2, Globe,
//   CheckCircle2, XCircle, Eye, X, MapPin, Mail, Phone,
//   MessageCircle, Users, User, GitBranch, UserCheck, ShieldCheck,
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '../../services/api';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// // Define API_BASE if it's external, or fallback safely
// const API_BASE = window.API_BASE || '';

// // ─── Customer Detail Modal ────────────────────────────────────────

// const CustomerViewModal = ({ customer, onClose }) => {
//   if (!customer) return null;

//   const InfoRow = ({ icon: Icon, label, value }) =>
//     value ? (
//       <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200">
//         <div className="mt-1 p-2.5 rounded-lg bg-indigo-50 flex-shrink-0">
//           <Icon size={16} className="text-indigo-600" />
//         </div>
//         <div className="min-w-0 flex-1">
//           <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
//           <p className="text-sm text-slate-800 font-medium leading-relaxed break-words">{value}</p>
//         </div>
//       </div>
//     ) : null;

//   const TagList = ({ icon: Icon, label, items }) => {
//     const filtered = (items || []).filter(Boolean);
//     if (!filtered.length) return null;
//     return (
//       <div className="space-y-3">
//         <div className="flex items-center gap-2.5">
//           <div className="p-2 bg-indigo-100 rounded-lg">
//             <Icon size={14} className="text-indigo-600" />
//           </div>
//           <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</span>
//           <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-bold">{filtered.length}</span>
//         </div>
//         <div className="flex flex-wrap gap-2.5">
//           {filtered.map((item, i) => (
//             <span key={i} className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 text-sm rounded-lg font-medium border border-indigo-200 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-150 shadow-sm">{item}</span>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-md">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-slate-200">

//         {/* Hero Section - Company Profile Header */}
//         <div className="relative h-40 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700 overflow-hidden">
//           <div className="absolute inset-0 opacity-10">
//             <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full"></div>
//             <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full"></div>
//           </div>
          
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all duration-200 backdrop-blur-sm z-10"
//             aria-label="Close modal"
//           >
//             <X size={20} />
//           </button>

//           <div className="relative h-full flex items-end px-8 pb-6">
//             <div className="flex flex-col sm:flex-row items-end gap-6 w-full">
//               <div className="relative">
//                 {customer.company_logo ? (
//                   <img
//                     src={`${API_BASE}${customer.company_logo}`}
//                     alt={customer.company_name}
//                     className="h-24 w-24 rounded-2xl object-cover border-4 border-white shadow-lg"
//                   />
//                 ) : (
//                   <div className="h-24 w-24 rounded-2xl bg-white flex items-center justify-center shadow-lg border-4 border-white">
//                     <Building2 size={40} className="text-indigo-600" />
//                   </div>
//                 )}
//               </div>
              
//               <div className="flex-1 pb-1">
//                 <h2 className="text-3xl font-bold text-white mb-2">{customer.company_name || '—'}</h2>
//                 <div className="flex items-center gap-3">
//                   <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm ${
//                     customer.customer_status === 'active'
//                       ? 'bg-emerald-400/90 text-white'
//                       : 'bg-red-400/90 text-white'
//                   }`}>
//                     {customer.customer_status === 'active'
//                       ? <><CheckCircle2 size={16} /> Active</>
//                       : <><XCircle size={16} /> Inactive</>}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Content Section */}
//         <div className="p-8 space-y-8">
//           <div>
//             <div className="flex items-center gap-3 mb-5">
//               <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl">
//                 <Building2 size={20} className="text-indigo-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-bold text-slate-900">Company Details</h3>
//                 <p className="text-xs text-slate-500 mt-0.5">General information and contact details</p>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//               <InfoRow icon={Globe} label="Website" value={customer.website} />
//               <InfoRow icon={MapPin} label="Office Address" value={customer.office_address} />
//               <InfoRow icon={MessageCircle} label="Company Note" value={customer.customer_note} />
//             </div>
//           </div>

//           <div className="border-t border-slate-200"></div>

//           {/* Account Manager */}
//           {customer.account_manager_name && (
//             <>
//               <div>
//                 <div className="flex items-center gap-3 mb-5">
//                   <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl">
//                     <UserCheck size={20} className="text-amber-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-bold text-slate-900">Account Manager</h3>
//                     <p className="text-xs text-slate-500 mt-0.5">Dedicated point of contact</p>
//                   </div>
//                 </div>
//                 <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     <InfoRow icon={User} label="Full Name" value={customer.account_manager_name} />
//                     <InfoRow icon={UserCheck} label="Designation" value={customer.account_manager_designation} />
//                     <InfoRow icon={GitBranch} label="Branch" value={customer.account_manager_branch} />
//                     <InfoRow icon={Mail} label="Email" value={customer.account_manager_email} />
//                     <InfoRow icon={Phone} label="Contact Number" value={customer.account_manager_contact} />
//                     <InfoRow icon={MessageCircle} label="WhatsApp" value={customer.account_manager_whatsapp} />
//                   </div>
//                 </div>
//               </div>

//               <div className="border-t border-slate-200"></div>
//             </>
//           )}

//           {/* Support / NOC */}
//           {(customer.support_emails?.some(Boolean) ||
//             customer.support_mobiles?.some(Boolean) ||
//             customer.support_whatsapp_numbers?.some(Boolean) ||
//             customer.support_whatsapp_groups?.some(Boolean)) && (
//             <>
//               <div>
//                 <div className="flex items-center gap-3 mb-5">
//                   <div className="p-2.5 bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl">
//                     <ShieldCheck size={20} className="text-rose-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-bold text-slate-900">Support & NOC</h3>
//                     <p className="text-xs text-slate-500 mt-0.5">Technical support and network operations team</p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <TagList icon={Mail} label="Support Emails" items={customer.support_emails} />
//                   <TagList icon={Phone} label="Support Numbers" items={customer.support_mobiles} />
//                   <TagList icon={MessageCircle} label="WhatsApp Numbers" items={customer.support_whatsapp_numbers} />
//                   <TagList icon={Users} label="WhatsApp Groups" items={customer.support_whatsapp_groups} />
//                 </div>
//               </div>

//               <div className="border-t border-slate-200"></div>
//             </>
//           )}

//           {/* Contact Persons */}
//           {customer.contact_persons?.length > 0 && (
//             <div>
//               <div className="flex items-center gap-3 mb-5">
//                 <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl">
//                   <Users size={20} className="text-emerald-600" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-bold text-slate-900">Contact Persons</h3>
//                   <p className="text-xs text-slate-500 mt-0.5">{customer.contact_persons.length} key contacts</p>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {customer.contact_persons.map((person, i) => (
//                   <div key={i} className="border border-slate-300 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
//                     <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
//                       <div className="flex items-center gap-4">
//                         <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-md">
//                           <User size={18} className="text-emerald-600" />
//                         </div>
//                         <div>
//                           <p className="font-bold text-white text-base">{person.name || '—'}</p>
//                           <p className="text-emerald-100 text-sm">{person.designation || 'N/A'}</p>
//                         </div>
//                       </div>
//                       <div className="flex flex-col gap-2">
//                         <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-lg font-bold uppercase backdrop-blur-sm capitalize">
//                           {person.contact_type}
//                         </span>
//                         <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-lg font-bold uppercase backdrop-blur-sm">
//                           {person.contact_level}
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="p-6 space-y-4">
//                       <TagList icon={Mail} label="Email Addresses" items={person.emails} />
//                       <TagList icon={Phone} label="Phone Numbers" items={person.mobiles} />
//                       <TagList icon={MessageCircle} label="WhatsApp" items={person.whatsapps} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Main Component ───────────────────────────────────────────────

// const CustomerManagment = () => {
//   const navigate = useNavigate();
//   const [customers, setCustomers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [status, setStatus] = useState('');
//   const [deletingId, setDeletingId] = useState(null);
//   const [viewingCustomer, setViewingCustomer] = useState(null);
//   const [isFetchingView, setIsFetchingView] = useState(false);

//   const fetchCustomers = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const params = {};
//       if (search) params.search = search;
//       if (status) params.status = status;
//       const { data } = await api.get('/api/customers', { params });
//       setCustomers(data.data || []);
//     } catch {
//       toast.error('Failed to load customers');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [search, status]);

//   useEffect(() => {
//     const timer = setTimeout(fetchCustomers, 300);
//     return () => clearTimeout(timer);
//   }, [fetchCustomers]);

//   const handleDelete = async (id, name) => {
//     if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
//     setDeletingId(id);
//     try {
//       await api.delete(`/api/customers/${id}`);
//       toast.success('Customer deleted');
//       setCustomers((prev) => prev.filter((c) => c.id !== id));
//     } catch {
//       toast.error('Failed to delete customer');
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const handleView = async (id) => {
//     setIsFetchingView(true);
//     try {
//       const { data } = await api.get(`/api/customers/${id}`);
//       setViewingCustomer(data);
//     } catch {
//       toast.error('Failed to load customer details');
//     } finally {
//       setIsFetchingView(false);
//     }
//   };

//   // ── Export helpers ─────────────────────────────────────────
//   const buildFlatRows = (customersList) => {
//     const rows = [];
//     let lastCompanyId = null;
//     let rowCountPerCompany = 0;

//     customersList.forEach((c) => {
//       const isNewCompany = c.id !== lastCompanyId;
//       if (isNewCompany) {
//         rowCountPerCompany = 0;
//         lastCompanyId = c.id;
//       }

//       const baseRowWithCompanyInfo = {
//         Company: c.company_name || '',
//         Website: c.website ? String(c.website).replace(/^https?:\/\//, '') : '',
//         'Account Manager Name': c.account_manager_name || '',
//         'Account Manager Mobile': c.account_manager_contact || '',
//         'Account Manager Email': c.account_manager_email || '',
//         'Account Manager WhatsApp': c.account_manager_whatsapp || '',
//         Status: c.customer_status || '',
//       };

//       const baseRowBlank = {
//         Company: '',
//         Website: '',
//         'Account Manager Name': '',
//         'Account Manager Mobile': '',
//         'Account Manager Email': '',
//         'Account Manager WhatsApp': '',
//         Status: '',
//       };

//       // Gather support array elements
//       const supportEmails = (c.support_emails || []).filter(Boolean);
//       const supportNumbers = (c.support_mobiles || []).filter(Boolean);
//       const supportWhatsApps = (c.support_whatsapp_numbers || []).filter(Boolean);
//       const supportGroups = (c.support_whatsapp_groups || []).filter(Boolean);
//       const maxSupportRows = Math.max(supportEmails.length, supportNumbers.length, supportWhatsApps.length, supportGroups.length);

//       // Flatten contact persons data into consecutive list maps
//       const flattenedContacts = [];
//       const persons = c.contact_persons || [];
//       persons.forEach((p) => {
//         const emails = (p.emails || []).filter(Boolean);
//         const mobiles = (p.mobiles || []).filter(Boolean);
//         const whats = (p.whatsapps || []).filter(Boolean);
//         const dynamicContactRows = Math.max(emails.length, mobiles.length, whats.length);
//         const maxContactRows = dynamicContactRows > 0 ? dynamicContactRows : 1;

//         for (let i = 0; i < maxContactRows; i++) {
//           flattenedContacts.push({
//             // Changed logic here: repeats the person's name on all rows instead of leaving it blank
//             name: p.name || '',
//             email: emails[i] || '',
//             mobile: mobiles[i] || '',
//             whatsapp: whats[i] || '',
//           });
//         }
//       });

//       // Unified layout calculation: prevents empty rows by merging on parallel line indices
//       const maxCompanyRows = Math.max(1, maxSupportRows, flattenedContacts.length);

//       for (let i = 0; i < maxCompanyRows; i++) {
//         const row = rowCountPerCompany === 0 ? { ...baseRowWithCompanyInfo } : { ...baseRowBlank };
        
//         // Map Support Columns directly to line index
//         row['Support Emails'] = supportEmails[i] || '';
//         row['Support Numbers'] = supportNumbers[i] || '';
//         row['Support WhatsApps'] = supportWhatsApps[i] || '';
//         row['Support WhatsApp Groups'] = supportGroups[i] || '';

//         // Map Contact Columns synchronously to the exact same line index
//         const currentContact = flattenedContacts[i];
//         row['Contact Name'] = currentContact ? currentContact.name : '';
//         row['Contact Email'] = currentContact ? currentContact.email : '';
//         row['Contact Number'] = currentContact ? currentContact.mobile : '';
//         row['Contact WhatsApp'] = currentContact ? currentContact.whatsapp : '';

//         rows.push(row);
//         rowCountPerCompany++;
//       }
//     });
//     return rows;
//   };

//   const exportToExcel = (customersList) => {
//     try {
//       const data = buildFlatRows(customersList);
//       const ws = XLSX.utils.json_to_sheet(data);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, 'Customers');
//       const colWidths = [15, 15, 20, 20, 20, 20, 10, 20, 20, 20, 24, 20, 20, 20, 20];
//       ws['!cols'] = colWidths.map(w => ({ wch: w }));
//       XLSX.writeFile(wb, `customers_${new Date().toISOString().slice(0,10)}.xlsx`);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to export Excel');
//     }
//   };

//   const exportToCSV = (customersList) => {
//     try {
//       const data = buildFlatRows(customersList);
//       const ws = XLSX.utils.json_to_sheet(data);
//       const csv = XLSX.utils.sheet_to_csv(ws);
//       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(blob);
//       link.setAttribute('download', `customers_${new Date().toISOString().slice(0,10)}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to export CSV');
//     }
//   };

//   const exportToPDF = (customersList) => {
//     try {
//       const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
//       const data = buildFlatRows(customersList).map((r) => [
//         r.Company,
//         r.Website,
//         r['Account Manager Name'],
//         r['Account Manager Mobile'],
//         r['Account Manager Email'],
//         r['Account Manager WhatsApp'],
//         r.Status,
//         r['Support Emails'],
//         r['Support Numbers'],
//         r['Support WhatsApps'],
//         r['Support WhatsApp Groups'],
//         r['Contact Name'],
//         r['Contact Email'],
//         r['Contact Number'],
//         r['Contact WhatsApp'],
//       ]);

//       const head = [[
//         'Company','Website','AM Name','AM Mobile','AM Email','AM WhatsApp','Status',
//         'Support Emails','Support Numbers','Support WhatsApps','Support Groups',
//         'Contact Name','Contact Email','Contact Number','Contact WhatsApp',
//       ]];

//       doc.text('Customers List Export', 40, 40);
//       doc.autoTable({
//         head,
//         body: data,
//         startY: 60,
//         styles: { fontSize: 6, overflow: 'linebreak', cellPadding: 3 },
//         headStyles: { fillColor: [79, 70, 229], textColor: 255 },
//         theme: 'grid',
//         columnStyles: {
//           0: { cellWidth: 60 },
//           1: { cellWidth: 50 },
//           2: { cellWidth: 50 },
//           3: { cellWidth: 50 },
//           4: { cellWidth: 55 },
//           5: { cellWidth: 50 },
//           6: { cellWidth: 35 },
//           7: { cellWidth: 55 },
//           8: { cellWidth: 50 },
//           9: { cellWidth: 50 },
//           10: { cellWidth: 50 },
//           11: { cellWidth: 50 },
//           12: { cellWidth: 55 },
//           13: { cellWidth: 50 },
//           14: { cellWidth: 50 },
//         },
//       });
//       doc.save(`customers_${new Date().toISOString().slice(0,10)}.pdf`);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to export PDF');
//     }
//   };

//   return (
//     <>
//       {/* View Modal */}
//       {viewingCustomer && (
//         <CustomerViewModal
//           customer={viewingCustomer}
//           onClose={() => setViewingCustomer(null)}
//         />
//       )}

//       {/* Fetching overlay for view */}
//       {isFetchingView && (
//         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
//           <div className="bg-white rounded-lg px-5 py-4 flex items-center gap-3 shadow-lg border border-slate-200">
//             <Loader2 size={18} className="animate-spin text-indigo-600" />
//             <span className="text-xs font-medium text-slate-700">Loading customer details...</span>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto p-4 space-y-4">
//         {/* Header */}
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2.5 rounded-lg bg-indigo-100">
//                 <Building2 className="text-indigo-600" size={20} />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-slate-900">Customers</h1>
//                 <p className="text-xs text-slate-500 mt-0.5">{customers.length} Total</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="inline-flex items-center gap-2">
//                 <button
//                   onClick={() => exportToCSV(customers)}
//                   className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 shadow-sm"
//                 >CSV</button>
//                 <button
//                   onClick={() => exportToExcel(customers)}
//                   className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 shadow-sm"
//                 >XLSX</button>
//                 <button
//                   onClick={() => exportToPDF(customers)}
//                   className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 shadow-sm"
//                 >PDF</button>
//               </div>

//               <div className="inline-flex items-center">
//                 <button
//                   onClick={() => navigate('/customers/add')}
//                   className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md transition-all duration-200 text-xs"
//                 >
//                   <Plus size={16} /> Add Customer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
//           <div className="flex flex-wrap gap-3">
//             <div className="relative flex-1 min-w-[200px]">
//               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//               <input
//                 type="text" value={search} onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search by name, manager, email..."
//                 className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
//               />
//             </div>
//             <select
//               value={status} onChange={(e) => setStatus(e.target.value)}
//               className="px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
//             >
//               <option value="">All statuses</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-48">
//               <Loader2 size={24} className="animate-spin text-indigo-600" />
//             </div>
//           ) : customers.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
//               <Building2 size={40} className="text-slate-300" />
//               <p className="text-sm font-medium">No customers found</p>
//               <p className="text-xs">Try adjusting your search or add a new customer.</p>
//             </div>
//           ) : (
//             <table className="w-full text-xs">
//               <thead>
//                 <tr className="border-b border-slate-200 bg-slate-50 text-left">
//                   <th className="px-5 py-3 font-semibold text-slate-700">Company</th>
//                   <th className="px-5 py-3 font-semibold text-slate-700 hidden md:table-cell">Website</th>
//                   <th className="px-5 py-3 font-semibold text-slate-700 hidden lg:table-cell">Account Manager</th>
//                   <th className="px-5 py-3 font-semibold text-slate-700">Status</th>
//                   <th className="px-5 py-3 font-semibold text-slate-700 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {customers.map((c) => (
//                   <tr key={c.id} className="hover:bg-slate-50 transition-colors duration-150">
//                     <td className="px-5 py-3">
//                       <div className="flex items-center gap-3">
//                         {c.company_logo ? (
//                           <img
//                             src={`${API_BASE}${c.company_logo}`}
//                             alt={c.company_name}
//                             className="h-8 w-8 rounded-lg object-cover border border-slate-200"
//                           />
//                         ) : (
//                           <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
//                             <Building2 size={16} className="text-indigo-600" />
//                           </div>
//                         )}
//                         <span className="font-medium text-slate-700 text-sm">{c.company_name || '—'}</span>
//                       </div>
//                     </td>
//                     <td className="px-5 py-3 text-slate-500 hidden md:table-cell">
//                       {c.website ? (
//                         <a href={c.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 hover:underline transition-colors text-xs">
//                           <Globe size={14} /> {c.website.replace(/^https?:\/\//, '')}
//                         </a>
//                       ) : '—'}
//                     </td>
//                     <td className="px-5 py-3 hidden lg:table-cell">
//                       <p className="text-slate-700 font-medium text-sm">{c.account_manager_name || '—'}</p>
//                       {c.account_manager_email && (
//                         <p className="text-xs text-slate-400 mt-0.5">{c.account_manager_email}</p>
//                       )}
//                     </td>
//                     <td className="px-5 py-3">
//                       {c.customer_status === 'active' ? (
//                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
//                           <CheckCircle2 size={12} /> Active
//                         </span>
//                       ) : (
//                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
//                           <XCircle size={12} /> Inactive
//                         </span>
//                       )}
//                     </td>
//                     <td className="px-5 py-3">
//                       <div className="flex items-center justify-end gap-2">
//                         <button
//                           onClick={() => handleView(c.id)}
//                           className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-150 focus:ring-1 focus:ring-emerald-500"
//                           title="View details"
//                           aria-label={`View details for ${c.company_name}`}
//                         >
//                           <Eye size={16} />
//                         </button>
//                         <button
//                           onClick={() => navigate(`/customers/${c.id}/edit`)}
//                           className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150 focus:ring-1 focus:ring-indigo-500"
//                           title="Edit customer"
//                           aria-label={`Edit ${c.company_name}`}
//                         >
//                           <Pencil size={16} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(c.id, c.company_name)}
//                           disabled={deletingId === c.id}
//                           className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 disabled:opacity-50 focus:ring-1 focus:ring-red-500"
//                           title="Delete customer"
//                           aria-label={`Delete ${c.company_name}`}
//                         >
//                           {deletingId === c.id
//                             ? <Loader2 size={16} className="animate-spin" />
//                             : <Trash2 size={16} />}
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default CustomerManagment;
