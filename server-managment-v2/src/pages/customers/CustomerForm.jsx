import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft, Save, Loader2, Plus, Trash2, Building2, Globe,
  MapPin, Upload, UserCheck, MessageSquare, LayoutGrid, Mail,
  Phone, MessageCircle, Users, ShieldCheck, Smartphone, User,
  Building, CheckCircle2, GitBranch,
} from 'lucide-react';

import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── constants ───────────────────────────────────────────────────

const BLANK_PERSON = {
  name: '',
  designation: '',
  contact_type: 'technical',
  contact_level: 'Level-1',
  emails: [''],
  mobiles: [''],
  whatsapps: [''],
};

const INITIAL_FORM = {
  company_name: '',
  company_logo: null,        // File object (new upload) or null
  company_logo_url: '',      // Existing URL from server
  website: '',
  office_address: '',
  customer_note: '',
  customer_status: 'active',

  account_manager_name: '',
  account_manager_designation: '',
  account_manager_email: '',
  account_manager_contact: '',
  account_manager_whatsapp: '',
  account_manager_branch: '',

  support_emails: [''],
  support_mobiles: [''],
  support_whatsapp_numbers: [''],
  support_whatsapp_groups: [''],

  contact_persons: [{ ...BLANK_PERSON, emails: [''], mobiles: [''], whatsapps: [''] }],
};

// ─── shared Tailwind classes ──────────────────────────────────────

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm';
const iconInputClass =
  'w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm';

// ─── component ───────────────────────────────────────────────────

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();          // present when editing
  const isEdit = Boolean(id);

  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // ── load existing customer when editing ──────────────────────

  useEffect(() => {
    if (!isEdit) return;

    const fetchCustomer = async () => {
      try {
        const { data } = await api.get(`/api/customers/${id}`);
        setFormData({
          company_name: data.company_name ?? '',
          company_logo: null,
          company_logo_url: data.company_logo ?? '',
          website: data.website ?? '',
          office_address: data.office_address ?? '',
          customer_note: data.customer_note ?? '',
          customer_status: data.customer_status ?? 'active',

          account_manager_name: data.account_manager_name ?? '',
          account_manager_designation: data.account_manager_designation ?? '',
          account_manager_email: data.account_manager_email ?? '',
          account_manager_contact: data.account_manager_contact ?? '',
          account_manager_whatsapp: data.account_manager_whatsapp ?? '',
          account_manager_branch: data.account_manager_branch ?? '',

          support_emails: data.support_emails?.length ? data.support_emails : [''],
          support_mobiles: data.support_mobiles?.length ? data.support_mobiles : [''],
          support_whatsapp_numbers: data.support_whatsapp_numbers?.length ? data.support_whatsapp_numbers : [''],
          support_whatsapp_groups: data.support_whatsapp_groups?.length ? data.support_whatsapp_groups : [''],

          contact_persons: data.contact_persons?.length
            ? data.contact_persons.map((p) => ({
                id: p.id ?? 0,
                name: p.name ?? '',
                designation: p.designation ?? '',
                contact_type: p.contact_type ?? 'technical',
                contact_level: p.contact_level ?? 'Level-1',
                emails: p.emails?.length ? p.emails : [''],
                mobiles: p.mobiles?.length ? p.mobiles : [''],
                whatsapps: p.whatsapps?.length ? p.whatsapps : [''],
              }))
            : [{ ...BLANK_PERSON, id: 0, emails: [''], mobiles: [''], whatsapps: [''] }],
        });
      } catch {
        toast.error('Failed to load customer');
        navigate('/customers');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCustomer();
  }, [id, isEdit, navigate]);

  // ── generic handlers ─────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, company_logo: file }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const addCommonField = (field) =>
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));

  const removeCommonField = (field, index) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  // ── contact person handlers ───────────────────────────────────

  const handleContactPersonChange = (index, field, value) => {
    const updated = [...formData.contact_persons];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, contact_persons: updated }));
  };

  const handleContactArrayChange = (personIndex, field, arrayIndex, value) => {
    const updated = [...formData.contact_persons];
    updated[personIndex][field][arrayIndex] = value;
    setFormData((prev) => ({ ...prev, contact_persons: updated }));
  };

  const addContactArrayField = (personIndex, field) => {
    const updated = [...formData.contact_persons];
    updated[personIndex][field].push('');
    setFormData((prev) => ({ ...prev, contact_persons: updated }));
  };

  const removeContactArrayField = (personIndex, field, arrayIndex) => {
    const updated = [...formData.contact_persons];
    updated[personIndex][field].splice(arrayIndex, 1);
    setFormData((prev) => ({ ...prev, contact_persons: updated }));
  };

  const addContactPerson = () =>
    setFormData((prev) => ({
      ...prev,
      contact_persons: [
        ...prev.contact_persons,
        { ...BLANK_PERSON, id: 0, emails: [''], mobiles: [''], whatsapps: [''] },
      ],
    }));

  const removeContactPerson = async (index) => {
    const person = formData.contact_persons[index];
    
    // Check if editing an existing entry and person is structurally committed to the DB
    if (isEdit && person && person.id && person.id > 0) {
      if (!window.confirm(`Delete contact person "${person.name || 'this person'}"? This cannot be undone.`)) {
        return;
      }

      setIsLoading(true);
      try {
        await api.delete(`/api/customers/${id}/contacts`, {
          params: { contact_id: person.id }
        });

        toast.success('Contact person deleted successfully');
        
        let updated = formData.contact_persons.filter((_, i) => i !== index);
        if (updated.length === 0) {
          updated = [{ ...BLANK_PERSON, id: 0, emails: [''], mobiles: [''], whatsapps: [''] }];
        }
        setFormData((prev) => ({ ...prev, contact_persons: updated }));
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to remove contact person');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Unsaved interface addition: strip layout index directly
      let updated = [...formData.contact_persons];
      updated.splice(index, 1);
      if (updated.length === 0) {
        updated = [{ ...BLANK_PERSON, id: 0, emails: [''], mobiles: [''], whatsapps: [''] }];
      }
      setFormData((prev) => ({ ...prev, contact_persons: updated }));
    }
  };

  // ── build FormData for API ────────────────────────────────────

  const buildFormData = () => {
    const fd = new FormData();

    const ARRAY_FIELDS = [
      'support_emails', 'support_mobiles',
      'support_whatsapp_numbers', 'support_whatsapp_groups',
    ];

    Object.keys(formData).forEach((key) => {
      if (key === 'contact_persons') {
        fd.append('contact_persons', JSON.stringify(formData.contact_persons));
      } else if (ARRAY_FIELDS.includes(key)) {
        fd.append(key, JSON.stringify(formData[key]));
      } else if (key === 'company_logo') {
        if (formData.company_logo) fd.append('company_logo', formData.company_logo);
      } else if (key !== 'company_logo_url') {
        fd.append(key, formData[key] ?? '');
      }
    });

    return fd;
  };

  // ── submit ────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const fd = buildFormData();
    const headers = { 'Content-Type': 'multipart/form-data' };

    try {
      if (isEdit) {
        await api.put(`/api/customers/${id}`, fd, { headers });
        toast.success('Customer updated successfully');
      } else {
        await api.post('/api/customers', fd, { headers });
        toast.success('Customer created successfully');
      }
      navigate('/customers');
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} customer`);
    } finally {
      setIsLoading(false);
    }
  };

  // ── loading state ─────────────────────────────────────────────

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate('/customers')}
        className="inline-flex items-center text-slate-600 hover:text-indigo-600 font-medium transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back To Customers
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-100">
              <Building2 className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isEdit ? 'Edit Customer' : 'Create Customer'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage company profile and customer contact details
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">

          {/* ── COMPANY DETAILS ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">Company Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Building size={14} className="text-slate-400" /> Company Name
                  </label>
                  <input
                    type="text" name="company_name" value={formData.company_name}
                    onChange={handleChange} className={inputClass} placeholder="Example Ltd."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Globe size={14} className="text-slate-400" /> Website
                  </label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text" name="website" value={formData.website}
                      onChange={handleChange} className={iconInputClass} placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-slate-400" /> Status
                    </label>
                    <select name="customer_status" value={formData.customer_status} onChange={handleChange} className={inputClass}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Company Logo</label>

                    {/* Show existing logo thumbnail when editing */}
                    {isEdit && formData.company_logo_url && !formData.company_logo && (
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${formData.company_logo_url}`}
                        alt="Current logo"
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 mb-1"
                      />
                    )}

                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all overflow-hidden"
                    >
                      <Upload size={18} className="text-indigo-600 flex-shrink-0" />
                      <span className="text-sm text-slate-500 truncate">
                        {formData.company_logo
                          ? formData.company_logo.name
                          : isEdit ? 'Replace Logo' : 'Upload Logo'}
                      </span>
                      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" /> Office Address
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
                    <textarea
                      rows={3} name="office_address" value={formData.office_address} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm"
                      placeholder="Full office address details..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-400" /> Customer Note
                  </label>
                  <div className="relative">
                    <MessageSquare size={18} className="absolute left-3 top-3 text-slate-400" />
                    <textarea
                      rows={3} name="customer_note" value={formData.customer_note} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm"
                      placeholder="Additional internal comments..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ACCOUNT MANAGER ── */}
          <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2">
              <UserCheck size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">Account Manager</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Full Name', icon: User, name: 'account_manager_name', placeholder: 'Manager Name' },
                { label: 'Designation', icon: UserCheck, name: 'account_manager_designation', placeholder: 'e.g. Senior Manager' },
                { label: 'Branch', icon: GitBranch, name: 'account_manager_branch', placeholder: 'Office Branch' },
                { label: 'Email Address', icon: Mail, name: 'account_manager_email', type: 'email', placeholder: 'manager@example.com' },
                { label: 'Contact Number', icon: Phone, name: 'account_manager_contact', placeholder: '+8801...' },
                { label: 'WhatsApp Number', icon: MessageCircle, name: 'account_manager_whatsapp', placeholder: '+8801...' },
              ].map(({ label, icon: Icon, name, type = 'text', placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" /> {label}
                  </label>
                  <input
                    type={type} name={name} value={formData[name]}
                    onChange={handleChange} className={inputClass} placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── SUPPORT / NOC CONTACTS ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">Common Support / NOC Contacts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { field: 'support_emails', label: 'Support Emails', icon: Mail, type: 'email', placeholder: 'support@example.com' },
                { field: 'support_mobiles', label: 'Support Numbers', icon: Phone, type: 'text', placeholder: '+8801...' },
                { field: 'support_whatsapp_numbers', label: 'WhatsApp Numbers', icon: MessageCircle, type: 'text', placeholder: '+8801...' },
                { field: 'support_whatsapp_groups', label: 'WhatsApp Groups', icon: Users, type: 'text', placeholder: 'Invite Link' },
              ].map(({ field, label, icon: Icon, type, placeholder }) => (
                <div key={field} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-slate-400" />
                      <h3 className="font-semibold text-slate-700 text-sm">{label}</h3>
                    </div>
                    <button type="button" onClick={() => addCommonField(field)} className="text-indigo-600 hover:text-indigo-700">
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData[field].map((val, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type={type} value={val}
                          onChange={(e) => handleArrayChange(field, index, e.target.value)}
                          className={inputClass} placeholder={placeholder}
                        />
                        {index > 0 && (
                          <button type="button" onClick={() => removeCommonField(field, index)} className="px-3 bg-red-50 rounded-xl text-red-600">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CONTACT PERSONS ── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">Contact Persons</h2>
              </div>
              <button
                type="button" onClick={addContactPerson}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-sm"
              >
                <Plus size={16} /> Add Contact Person
              </button>
            </div>

            {formData.contact_persons.map((person, personIndex) => {
              if (person._deleted) return null;
              
              return (
              <div key={personIndex} className="bg-slate-50 border border-slate-200 rounded-3xl p-8 relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <User size={16} className="text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">Contact Person #{personIndex + 1}</h3>
                  </div>
                  <button type="button" onClick={() => removeContactPerson(personIndex)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input type="text" value={person.name} onChange={(e) => handleContactPersonChange(personIndex, 'name', e.target.value)} className={inputClass} placeholder="Full Name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Designation</label>
                    <input type="text" value={person.designation} onChange={(e) => handleContactPersonChange(personIndex, 'designation', e.target.value)} className={inputClass} placeholder="Designation" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Type</label>
                    <select value={person.contact_type} onChange={(e) => handleContactPersonChange(personIndex, 'contact_type', e.target.value)} className={inputClass}>
                      <option value="technical">Technical</option>
                      <option value="sales">Sales</option>
                      <option value="billing">Billing</option>
                      <option value="level-1">Level-1</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Level</label>
                    <select value={person.contact_level} onChange={(e) => handleContactPersonChange(personIndex, 'contact_level', e.target.value)} className={inputClass}>
                      {['Level-1','Level-2','Level-3','Level-4','Level-5','Level-6'].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { field: 'emails', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'email@example.com' },
                    { field: 'mobiles', label: 'Contact Number', icon: Smartphone, type: 'text', placeholder: '+8801...' },
                    { field: 'whatsapps', label: 'WhatsApp', icon: MessageCircle, type: 'text', placeholder: '+8801...' },
                  ].map(({ field, label, icon: Icon, type, placeholder }) => (
                    <div key={field} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Icon size={14} className="text-indigo-500" /> {label}
                        </label>
                        <button type="button" onClick={() => addContactArrayField(personIndex, field)} className="text-indigo-600 hover:text-indigo-700">
                          <Plus size={16} />
                       </button>
                      </div>
                      {person[field].map((val, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type={type} value={val}
                            onChange={(e) => handleContactArrayChange(personIndex, field, idx, e.target.value)}
                            className={`${inputClass} !py-2`} placeholder={placeholder}
                          />
                          {idx > 0 && (
                            <button type="button" onClick={() => removeContactArrayField(personIndex, field, idx)} className="text-red-500 p-1">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
            })}
          </div>

          {/* ── ACTIONS ── */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
            <button
              type="button" onClick={() => navigate('/customers')}
              className="px-6 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isLoading}
              className="inline-flex items-center px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all text-sm"
            >
              {isLoading
                ? <Loader2 size={18} className="animate-spin mr-2" />
                : <Save size={18} className="mr-2" />}
              {isEdit ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;

















// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';

// import {
//   ArrowLeft, Save, Loader2, Plus, Trash2, Building2, Globe,
//   MapPin, Upload, UserCheck, MessageSquare, LayoutGrid, Mail,
//   Phone, MessageCircle, Users, ShieldCheck, Smartphone, User,
//   Building, CheckCircle2, GitBranch,
// } from 'lucide-react';

// import api from '../../services/api';
// import toast from 'react-hot-toast';

// // ─── constants ───────────────────────────────────────────────────

// const BLANK_PERSON = {
//   name: '',
//   designation: '',
//   contact_type: 'technical',
//   contact_level: 'Level-1',
//   emails: [''],
//   mobiles: [''],
//   whatsapps: [''],
// };

// const INITIAL_FORM = {
//   company_name: '',
//   company_logo: null,        // File object (new upload) or null
//   company_logo_url: '',      // Existing URL from server
//   website: '',
//   office_address: '',
//   customer_note: '',
//   customer_status: 'active',

//   account_manager_name: '',
//   account_manager_designation: '',
//   account_manager_email: '',
//   account_manager_contact: '',
//   account_manager_whatsapp: '',
//   account_manager_branch: '',

//   support_emails: [''],
//   support_mobiles: [''],
//   support_whatsapp_numbers: [''],
//   support_whatsapp_groups: [''],

//   contact_persons: [{ ...BLANK_PERSON, emails: [''], mobiles: [''], whatsapps: [''] }],
// };

// // ─── shared Tailwind classes ──────────────────────────────────────

// const inputClass =
//   'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm';
// const iconInputClass =
//   'w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm';

// // ─── component ───────────────────────────────────────────────────

// const CustomerForm = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();          // present when editing
//   const isEdit = Boolean(id);

//   const fileInputRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(isEdit);
//   const [formData, setFormData] = useState(INITIAL_FORM);

//   // ── load existing customer when editing ──────────────────────

//   useEffect(() => {
//     if (!isEdit) return;

//     const fetchCustomer = async () => {
//       try {
//         const { data } = await api.get(`/api/customers/${id}`);
//         setFormData({
//           company_name: data.company_name ?? '',
//           company_logo: null,
//           company_logo_url: data.company_logo ?? '',
//           website: data.website ?? '',
//           office_address: data.office_address ?? '',
//           customer_note: data.customer_note ?? '',
//           customer_status: data.customer_status ?? 'active',

//           account_manager_name: data.account_manager_name ?? '',
//           account_manager_designation: data.account_manager_designation ?? '',
//           account_manager_email: data.account_manager_email ?? '',
//           account_manager_contact: data.account_manager_contact ?? '',
//           account_manager_whatsapp: data.account_manager_whatsapp ?? '',
//           account_manager_branch: data.account_manager_branch ?? '',

//           support_emails: data.support_emails?.length ? data.support_emails : [''],
//           support_mobiles: data.support_mobiles?.length ? data.support_mobiles : [''],
//           support_whatsapp_numbers: data.support_whatsapp_numbers?.length ? data.support_whatsapp_numbers : [''],
//           support_whatsapp_groups: data.support_whatsapp_groups?.length ? data.support_whatsapp_groups : [''],

//           contact_persons: data.contact_persons?.length
//             ? data.contact_persons.map((p) => ({
//                 id: p.id ?? 0,
//                 name: p.name ?? '',
//                 designation: p.designation ?? '',
//                 contact_type: p.contact_type ?? 'technical',
//                 contact_level: p.contact_level ?? 'Level-1',
//                 emails: p.emails?.length ? p.emails : [''],
//                 mobiles: p.mobiles?.length ? p.mobiles : [''],
//                 whatsapps: p.whatsapps?.length ? p.whatsapps : [''],
//               }))
//             : [{ ...BLANK_PERSON, id: 0, emails: [''], mobiles: [''], whatsapps: [''] }],
//         });
//       } catch {
//         toast.error('Failed to load customer');
//         navigate('/customers');
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     fetchCustomer();
//   }, [id, isEdit, navigate]);

//   // ── generic handlers ─────────────────────────────────────────

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) setFormData((prev) => ({ ...prev, company_logo: file }));
//   };

//   const handleArrayChange = (field, index, value) => {
//     const updated = [...formData[field]];
//     updated[index] = value;
//     setFormData((prev) => ({ ...prev, [field]: updated }));
//   };

//   const addCommonField = (field) =>
//     setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));

//   const removeCommonField = (field, index) => {
//     const updated = [...formData[field]];
//     updated.splice(index, 1);
//     setFormData((prev) => ({ ...prev, [field]: updated }));
//   };

//   // ── contact person handlers ───────────────────────────────────

//   const handleContactPersonChange = (index, field, value) => {
//     const updated = [...formData.contact_persons];
//     updated[index][field] = value;
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const handleContactArrayChange = (personIndex, field, arrayIndex, value) => {
//     const updated = [...formData.contact_persons];
//     updated[personIndex][field][arrayIndex] = value;
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const addContactArrayField = (personIndex, field) => {
//     const updated = [...formData.contact_persons];
//     updated[personIndex][field].push('');
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const removeContactArrayField = (personIndex, field, arrayIndex) => {
//     const updated = [...formData.contact_persons];
//     updated[personIndex][field].splice(arrayIndex, 1);
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const addContactPerson = () =>
//     setFormData((prev) => ({
//       ...prev,
//       contact_persons: [
//         ...prev.contact_persons,
//         { ...BLANK_PERSON, id: 0, emails: [''], mobiles: [''], whatsapps: [''] },
//       ],
//     }));

//   const removeContactPerson = async (index) => {
//     const person = formData.contact_persons[index];
    
//     // Check if editing an existing entry and person is structurally committed to the DB
//     if (isEdit && person && person.id && person.id > 0) {
//       if (!window.confirm(`Delete contact person "${person.name || 'this person'}"? This cannot be undone.`)) {
//         return;
//       }

//       setIsLoading(true);
//       try {
//         // FIXED LOGIC: Firing directly towards your custom context endpoint schema 
//         await api.delete(`/api/customers/${id}/contacts`, {
//           params: { contact_id: person.id }
//         });

//         toast.success('Contact person deleted successfully');
        
//         // Filter locally upon structural confirmation from Go application
//         const updated = formData.contact_persons.filter((_, i) => i !== index);
//         setFormData((prev) => ({ ...prev, contact_persons: updated }));
//       } catch (err) {
//         toast.error(err.response?.data?.error || 'Failed to remove contact person');
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       // Unsaved interface addition: strip layout index directly
//       const updated = [...formData.contact_persons];
//       updated.splice(index, 1);
//       setFormData((prev) => ({ ...prev, contact_persons: updated }));
//     }
//   };

//   // ── build FormData for API ────────────────────────────────────

//   const buildFormData = () => {
//     const fd = new FormData();

//     const ARRAY_FIELDS = [
//       'support_emails', 'support_mobiles',
//       'support_whatsapp_numbers', 'support_whatsapp_groups',
//     ];

//     Object.keys(formData).forEach((key) => {
//       if (key === 'contact_persons') {
//         fd.append('contact_persons', JSON.stringify(formData.contact_persons));
//       } else if (ARRAY_FIELDS.includes(key)) {
//         fd.append(key, JSON.stringify(formData[key]));
//       } else if (key === 'company_logo') {
//         if (formData.company_logo) fd.append('company_logo', formData.company_logo);
//       } else if (key !== 'company_logo_url') {
//         fd.append(key, formData[key] ?? '');
//       }
//     });

//     return fd;
//   };

//   // ── submit ────────────────────────────────────────────────────

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const fd = buildFormData();
//     const headers = { 'Content-Type': 'multipart/form-data' };

//     try {
//       if (isEdit) {
//         await api.put(`/api/customers/${id}`, fd, { headers });
//         toast.success('Customer updated successfully');
//       } else {
//         await api.post('/api/customers', fd, { headers });
//         toast.success('Customer created successfully');
//       }
//       navigate('/customers');
//     } catch (error) {
//       toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} customer`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ── loading state ─────────────────────────────────────────────

//   if (isFetching) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 size={32} className="animate-spin text-indigo-600" />
//       </div>
//     );
//   }

//   // ─────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6">
//       <button
//         onClick={() => navigate('/customers')}
//         className="inline-flex items-center text-slate-600 hover:text-indigo-600 font-medium transition-colors"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back To Customers
//       </button>

//       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
//         {/* Header */}
//         <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
//           <div className="flex items-center gap-3">
//             <div className="p-3 rounded-2xl bg-indigo-100">
//               <Building2 className="text-indigo-600" size={24} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-slate-900">
//                 {isEdit ? 'Edit Customer' : 'Create Customer'}
//               </h1>
//               <p className="text-sm text-slate-500 mt-1">
//                 Manage company profile and customer contact details
//               </p>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-10">

//           {/* ── COMPANY DETAILS ── */}
//           <div className="space-y-6">
//             <div className="flex items-center gap-2 mb-2">
//               <LayoutGrid size={20} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Company Details</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
//               <div className="space-y-4">
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Building size={14} className="text-slate-400" /> Company Name
//                   </label>
//                   <input
//                     type="text" name="company_name" value={formData.company_name}
//                     onChange={handleChange} className={inputClass} placeholder="Example Ltd."
//                   />
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Globe size={14} className="text-slate-400" /> Website
//                   </label>
//                   <div className="relative">
//                     <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                     <input
//                       type="text" name="website" value={formData.website}
//                       onChange={handleChange} className={iconInputClass} placeholder="https://example.com"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                       <CheckCircle2 size={14} className="text-slate-400" /> Status
//                     </label>
//                     <select name="customer_status" value={formData.customer_status} onChange={handleChange} className={inputClass}>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Company Logo</label>

//                     {/* Show existing logo thumbnail when editing */}
//                     {isEdit && formData.company_logo_url && !formData.company_logo && (
//                       <img
//                         src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${formData.company_logo_url}`}
//                         alt="Current logo"
//                         className="h-10 w-10 rounded-lg object-cover border border-slate-200 mb-1"
//                       />
//                     )}

//                     <div
//                       onClick={() => fileInputRef.current.click()}
//                       className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all overflow-hidden"
//                     >
//                       <Upload size={18} className="text-indigo-600 flex-shrink-0" />
//                       <span className="text-sm text-slate-500 truncate">
//                         {formData.company_logo
//                           ? formData.company_logo.name
//                           : isEdit ? 'Replace Logo' : 'Upload Logo'}
//                       </span>
//                       <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <MapPin size={14} className="text-slate-400" /> Office Address
//                   </label>
//                   <div className="relative">
//                     <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
//                     <textarea
//                       rows={3} name="office_address" value={formData.office_address} onChange={handleChange}
//                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm"
//                       placeholder="Full office address details..."
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <MessageSquare size={14} className="text-slate-400" /> Customer Note
//                   </label>
//                   <div className="relative">
//                     <MessageSquare size={18} className="absolute left-3 top-3 text-slate-400" />
//                     <textarea
//                       rows={3} name="customer_note" value={formData.customer_note} onChange={handleChange}
//                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm"
//                       placeholder="Additional internal comments..."
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── ACCOUNT MANAGER ── */}
//           <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
//             <div className="flex items-center gap-2">
//               <UserCheck size={20} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Account Manager</h2>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[
//                 { label: 'Full Name', icon: User, name: 'account_manager_name', placeholder: 'Manager Name' },
//                 { label: 'Designation', icon: UserCheck, name: 'account_manager_designation', placeholder: 'e.g. Senior Manager' },
//                 { label: 'Branch', icon: GitBranch, name: 'account_manager_branch', placeholder: 'Office Branch' },
//                 { label: 'Email Address', icon: Mail, name: 'account_manager_email', type: 'email', placeholder: 'manager@example.com' },
//                 { label: 'Contact Number', icon: Phone, name: 'account_manager_contact', placeholder: '+8801...' },
//                 { label: 'WhatsApp Number', icon: MessageCircle, name: 'account_manager_whatsapp', placeholder: '+8801...' },
//               ].map(({ label, icon: Icon, name, type = 'text', placeholder }) => (
//                 <div key={name} className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Icon size={14} className="text-slate-400" /> {label}
//                   </label>
//                   <input
//                     type={type} name={name} value={formData[name]}
//                     onChange={handleChange} className={inputClass} placeholder={placeholder}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ── SUPPORT / NOC CONTACTS ── */}
//           <div className="space-y-6">
//             <div className="flex items-center gap-2">
//               <ShieldCheck size={20} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Common Support / NOC Contacts</h2>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
//               {[
//                 { field: 'support_emails', label: 'Support Emails', icon: Mail, type: 'email', placeholder: 'support@example.com' },
//                 { field: 'support_mobiles', label: 'Support Numbers', icon: Phone, type: 'text', placeholder: '+8801...' },
//                 { field: 'support_whatsapp_numbers', label: 'WhatsApp Numbers', icon: MessageCircle, type: 'text', placeholder: '+8801...' },
//                 { field: 'support_whatsapp_groups', label: 'WhatsApp Groups', icon: Users, type: 'text', placeholder: 'Invite Link' },
//               ].map(({ field, label, icon: Icon, type, placeholder }) => (
//                 <div key={field} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <Icon size={16} className="text-slate-400" />
//                       <h3 className="font-semibold text-slate-700 text-sm">{label}</h3>
//                     </div>
//                     <button type="button" onClick={() => addCommonField(field)} className="text-indigo-600 hover:text-indigo-700">
//                       <Plus size={18} />
//                     </button>
//                   </div>
//                   <div className="space-y-3">
//                     {formData[field].map((val, index) => (
//                       <div key={index} className="flex gap-2">
//                         <input
//                           type={type} value={val}
//                           onChange={(e) => handleArrayChange(field, index, e.target.value)}
//                           className={inputClass} placeholder={placeholder}
//                         />
//                         {index > 0 && (
//                           <button type="button" onClick={() => removeCommonField(field, index)} className="px-3 bg-red-50 rounded-xl text-red-600">
//                             <Trash2 size={16} />
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ── CONTACT PERSONS ── */}
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <User size={20} className="text-indigo-600" />
//                 <h2 className="text-lg font-bold text-slate-800">Contact Persons</h2>
//               </div>
//               <button
//                 type="button" onClick={addContactPerson}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-sm"
//               >
//                 <Plus size={16} /> Add Contact Person
//               </button>
//             </div>

//             {formData.contact_persons.map((person, personIndex) => {
//               if (person._deleted) return null;
              
//               return (
//               <div key={personIndex} className="bg-slate-50 border border-slate-200 rounded-3xl p-8 relative">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center gap-2">
//                     <div className="p-2 bg-white rounded-lg border border-slate-200">
//                       <User size={16} className="text-indigo-600" />
//                     </div>
//                     <h3 className="font-bold text-slate-800">Contact Person #{personIndex + 1}</h3>
//                   </div>
//                   {personIndex > 0 && (
//                     <button type="button" onClick={() => removeContactPerson(personIndex)} className="text-red-500 hover:text-red-700">
//                       <Trash2 size={20} />
//                     </button>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Full Name</label>
//                     <input type="text" value={person.name} onChange={(e) => handleContactPersonChange(personIndex, 'name', e.target.value)} className={inputClass} placeholder="Full Name" />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Designation</label>
//                     <input type="text" value={person.designation} onChange={(e) => handleContactPersonChange(personIndex, 'designation', e.target.value)} className={inputClass} placeholder="Designation" />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Type</label>
//                     <select value={person.contact_type} onChange={(e) => handleContactPersonChange(personIndex, 'contact_type', e.target.value)} className={inputClass}>
//                       <option value="technical">Technical</option>
//                       <option value="sales">Sales</option>
//                       <option value="billing">Billing</option>
//                       <option value="level-1">Level-1</option>
//                     </select>
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Level</label>
//                     <select value={person.contact_level} onChange={(e) => handleContactPersonChange(personIndex, 'contact_level', e.target.value)} className={inputClass}>
//                       {['Level-1','Level-2','Level-3','Level-4','Level-5','Level-6'].map((l) => (
//                         <option key={l} value={l}>{l}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {[
//                     { field: 'emails', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'email@example.com' },
//                     { field: 'mobiles', label: 'Contact Number', icon: Smartphone, type: 'text', placeholder: '+8801...' },
//                     { field: 'whatsapps', label: 'WhatsApp', icon: MessageCircle, type: 'text', placeholder: '+8801...' },
//                   ].map(({ field, label, icon: Icon, type, placeholder }) => (
//                     <div key={field} className="space-y-3">
//                       <div className="flex items-center justify-between">
//                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                           <Icon size={14} className="text-indigo-500" /> {label}
//                         </label>
//                         <button type="button" onClick={() => addContactArrayField(personIndex, field)} className="text-indigo-600 hover:text-indigo-700">
//                           <Plus size={16} />
//                         </button>
//                       </div>
//                       {person[field].map((val, idx) => (
//                         <div key={idx} className="flex gap-2">
//                           <input
//                             type={type} value={val}
//                             onChange={(e) => handleContactArrayChange(personIndex, field, idx, e.target.value)}
//                             className={`${inputClass} !py-2`} placeholder={placeholder}
//                           />
//                           {idx > 0 && (
//                             <button type="button" onClick={() => removeContactArrayField(personIndex, field, idx)} className="text-red-500 p-1">
//                               <Trash2 size={14} />
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             );
//             })}
//           </div>

//           {/* ── ACTIONS ── */}
//           <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
//             <button
//               type="button" onClick={() => navigate('/customers')}
//               className="px-6 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit" disabled={isLoading}
//               className="inline-flex items-center px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all text-sm"
//             >
//               {isLoading
//                 ? <Loader2 size={18} className="animate-spin mr-2" />
//                 : <Save size={18} className="mr-2" />}
//               {isEdit ? 'Update Customer' : 'Save Customer'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CustomerForm;



















// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';

// import {
//   ArrowLeft, Save, Loader2, Plus, Trash2, Building2, Globe,
//   MapPin, Upload, UserCheck, MessageSquare, LayoutGrid, Mail,
//   Phone, MessageCircle, Users, ShieldCheck, Smartphone, User,
//   Building, CheckCircle2, GitBranch,
// } from 'lucide-react';

// import api from '../../services/api';
// import toast from 'react-hot-toast';

// // ─── constants ───────────────────────────────────────────────────

// const BLANK_PERSON = {
//   name: '',
//   designation: '',
//   contact_type: 'technical',
//   contact_level: 'Level-1',
//   emails: [''],
//   mobiles: [''],
//   whatsapps: [''],
// };

// const INITIAL_FORM = {
//   company_name: '',
//   company_logo: null,        // File object (new upload) or null
//   company_logo_url: '',      // Existing URL from server
//   website: '',
//   office_address: '',
//   customer_note: '',
//   customer_status: 'active',

//   account_manager_name: '',
//   account_manager_designation: '',
//   account_manager_email: '',
//   account_manager_contact: '',
//   account_manager_whatsapp: '',
//   account_manager_branch: '',

//   support_emails: [''],
//   support_mobiles: [''],
//   support_whatsapp_numbers: [''],
//   support_whatsapp_groups: [''],

//   contact_persons: [{ ...BLANK_PERSON, emails: [''], mobiles: [''], whatsapps: [''] }],
// };

// // ─── shared Tailwind classes ──────────────────────────────────────

// const inputClass =
//   'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm';
// const iconInputClass =
//   'w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm';

// // ─── component ───────────────────────────────────────────────────

// const CustomerForm = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();          // present when editing
//   const isEdit = Boolean(id);

//   const fileInputRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(isEdit);
//   const [formData, setFormData] = useState(INITIAL_FORM);

//   // ── load existing customer when editing ──────────────────────

//   useEffect(() => {
//     if (!isEdit) return;

//     const fetchCustomer = async () => {
//       try {
//         const { data } = await api.get(`/api/customers/${id}`);
//         setFormData({
//           company_name: data.company_name ?? '',
//           company_logo: null,
//           company_logo_url: data.company_logo ?? '',
//           website: data.website ?? '',
//           office_address: data.office_address ?? '',
//           customer_note: data.customer_note ?? '',
//           customer_status: data.customer_status ?? 'active',

//           account_manager_name: data.account_manager_name ?? '',
//           account_manager_designation: data.account_manager_designation ?? '',
//           account_manager_email: data.account_manager_email ?? '',
//           account_manager_contact: data.account_manager_contact ?? '',
//           account_manager_whatsapp: data.account_manager_whatsapp ?? '',
//           account_manager_branch: data.account_manager_branch ?? '',

//           support_emails: data.support_emails?.length ? data.support_emails : [''],
//           support_mobiles: data.support_mobiles?.length ? data.support_mobiles : [''],
//           support_whatsapp_numbers: data.support_whatsapp_numbers?.length ? data.support_whatsapp_numbers : [''],
//           support_whatsapp_groups: data.support_whatsapp_groups?.length ? data.support_whatsapp_groups : [''],



//           contact_persons: data.contact_persons?.length
//             ? data.contact_persons.map((p) => ({
//                 id: p.id ?? 0,
//                 name: p.name ?? '',
//                 designation: p.designation ?? '',
//                 contact_type: p.contact_type ?? 'technical',
//                 contact_level: p.contact_level ?? 'Level-1',
//                 emails: p.emails?.length ? p.emails : [''],
//                 mobiles: p.mobiles?.length ? p.mobiles : [''],
//                 whatsapps: p.whatsapps?.length ? p.whatsapps : [''],
//              }))
//           // contact_persons: data.contact_persons?.length
//           //   ? data.contact_persons.map((p) => ({
//           //       name: p.name ?? '',
//           //       designation: p.designation ?? '',
//           //       contact_type: p.contact_type ?? 'technical',
//           //       contact_level: p.contact_level ?? 'Level-1',
//           //       emails: p.emails?.length ? p.emails : [''],
//           //       mobiles: p.mobiles?.length ? p.mobiles : [''],
//           //       whatsapps: p.whatsapps?.length ? p.whatsapps : [''],
//           //     }))
//             : [{ ...BLANK_PERSON, id: [''], emails: [''], mobiles: [''], whatsapps: [''] }],
//         });
//       } catch {
//         toast.error('Failed to load customer');
//         navigate('/customers');
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     fetchCustomer();
//   }, [id, isEdit, navigate]);

//   // ── generic handlers ─────────────────────────────────────────

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) setFormData((prev) => ({ ...prev, company_logo: file }));
//   };

//   const handleArrayChange = (field, index, value) => {
//     const updated = [...formData[field]];
//     updated[index] = value;
//     setFormData((prev) => ({ ...prev, [field]: updated }));
//   };

//   const addCommonField = (field) =>
//     setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));

//   const removeCommonField = (field, index) => {
//     const updated = [...formData[field]];
//     updated.splice(index, 1);
//     setFormData((prev) => ({ ...prev, [field]: updated }));
//   };

//   // ── contact person handlers ───────────────────────────────────

//   const handleContactPersonChange = (index, field, value) => {
//     const updated = [...formData.contact_persons];
//     updated[index][field] = value;
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const handleContactArrayChange = (personIndex, field, arrayIndex, value) => {
//     const updated = [...formData.contact_persons];
//     updated[personIndex][field][arrayIndex] = value;
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const addContactArrayField = (personIndex, field) => {
//     const updated = [...formData.contact_persons];
//     updated[personIndex][field].push('');
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const removeContactArrayField = (personIndex, field, arrayIndex) => {
//     const updated = [...formData.contact_persons];
//     updated[personIndex][field].splice(arrayIndex, 1);
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const addContactPerson = () =>
//     setFormData((prev) => ({
//       ...prev,
//       contact_persons: [
//         ...prev.contact_persons,
//         { ...BLANK_PERSON, emails: [''], mobiles: [''], whatsapps: [''] },
//       ],
//     }));

//   const removeContactPerson = (index) => {
//     const person = formData.contact_persons[index];
    
//     // If this is an existing saved person and we're editing an existing customer,
//     // perform an immediate delete via API so database removes the record right away.
//     if (isEdit && person && person.id && person.id > 0) {
//       // confirm
//       if (!window.confirm(`Delete contact person "${person.name || 'this person'}"? This cannot be undone.`)) return;

//       // Build a temporary FormData with same fields but without the deleted person
//       const temp = { ...formData, contact_persons: formData.contact_persons.filter((_, i) => i !== index) };
//       const fd = new FormData();
//       const ARRAY_FIELDS = [
//         'support_emails', 'support_mobiles',
//         'support_whatsapp_numbers', 'support_whatsapp_groups',
//       ];

//       Object.keys(temp).forEach((key) => {
//         if (key === 'contact_persons') {
//           fd.append('contact_persons', JSON.stringify(temp.contact_persons));
//         } else if (ARRAY_FIELDS.includes(key)) {
//           fd.append(key, JSON.stringify(temp[key]));
//         } else if (key === 'company_logo') {
//           if (temp.company_logo) fd.append('company_logo', temp.company_logo);
//         } else if (key !== 'company_logo_url') {
//           fd.append(key, temp[key] ?? '');
//         }
//       });

//       (async () => {
//         setIsLoading(true);
//         try {
//           await api.put(`/api/customers/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
//           toast.success('Contact person deleted');
//           // remove locally after successful delete
//           const updated = [...formData.contact_persons];
//           updated.splice(index, 1);
//           setFormData((prev) => ({ ...prev, contact_persons: updated }));
//         } catch (err) {
//           toast.error(err.response?.data?.error || 'Failed to delete contact person');
//         } finally {
//           setIsLoading(false);
//         }
//       })();
//     } else {
//       // If no ID (new unsaved person), just remove from array locally
//       const updated = [...formData.contact_persons];
//       updated.splice(index, 1);
//       setFormData((prev) => ({ ...prev, contact_persons: updated }));
//     }
//   };

//   // ── build FormData for API ────────────────────────────────────

//   const buildFormData = () => {
//     const fd = new FormData();

//     const ARRAY_FIELDS = [
//       'support_emails', 'support_mobiles',
//       'support_whatsapp_numbers', 'support_whatsapp_groups',
//     ];

//     Object.keys(formData).forEach((key) => {
//       if (key === 'contact_persons') {
//         fd.append('contact_persons', JSON.stringify(formData.contact_persons));
//       } else if (ARRAY_FIELDS.includes(key)) {
//         fd.append(key, JSON.stringify(formData[key]));
//       } else if (key === 'company_logo') {
//         if (formData.company_logo) fd.append('company_logo', formData.company_logo);
//         // if null (no new file), do not append — backend keeps existing
//       } else if (key !== 'company_logo_url') {
//         fd.append(key, formData[key] ?? '');
//       }
//     });

//     return fd;
//   };

//   // ── submit ────────────────────────────────────────────────────

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const fd = buildFormData();
//     const headers = { 'Content-Type': 'multipart/form-data' };

//     try {
//       if (isEdit) {
//         await api.put(`/api/customers/${id}`, fd, { headers });
//         toast.success('Customer updated successfully');
//       } else {
//         await api.post('/api/customers', fd, { headers });
//         toast.success('Customer created successfully');
//       }
//       navigate('/customers');
//     } catch (error) {
//       toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} customer`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ── loading state ─────────────────────────────────────────────

//   if (isFetching) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 size={32} className="animate-spin text-indigo-600" />
//       </div>
//     );
//   }

//   // ─────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6">
//       <button
//         onClick={() => navigate('/customers')}
//         className="inline-flex items-center text-slate-600 hover:text-indigo-600 font-medium transition-colors"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back To Customers
//       </button>

//       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
//         {/* Header */}
//         <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
//           <div className="flex items-center gap-3">
//             <div className="p-3 rounded-2xl bg-indigo-100">
//               <Building2 className="text-indigo-600" size={24} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-slate-900">
//                 {isEdit ? 'Edit Customer' : 'Create Customer'}
//               </h1>
//               <p className="text-sm text-slate-500 mt-1">
//                 Manage company profile and customer contact details
//               </p>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-10">

//           {/* ── COMPANY DETAILS ── */}
//           <div className="space-y-6">
//             <div className="flex items-center gap-2 mb-2">
//               <LayoutGrid size={20} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Company Details</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
//               <div className="space-y-4">
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Building size={14} className="text-slate-400" /> Company Name
//                   </label>
//                   <input
//                     type="text" name="company_name" value={formData.company_name}
//                     onChange={handleChange} className={inputClass} placeholder="Example Ltd."
//                   />
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Globe size={14} className="text-slate-400" /> Website
//                   </label>
//                   <div className="relative">
//                     <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                     <input
//                       type="text" name="website" value={formData.website}
//                       onChange={handleChange} className={iconInputClass} placeholder="https://example.com"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                       <CheckCircle2 size={14} className="text-slate-400" /> Status
//                     </label>
//                     <select name="customer_status" value={formData.customer_status} onChange={handleChange} className={inputClass}>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Company Logo</label>

//                     {/* Show existing logo thumbnail when editing */}
//                     {isEdit && formData.company_logo_url && !formData.company_logo && (
//                       <img
//                         src={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${formData.company_logo_url}`}
//                         alt="Current logo"
//                         className="h-10 w-10 rounded-lg object-cover border border-slate-200 mb-1"
//                       />
//                     )}

//                     <div
//                       onClick={() => fileInputRef.current.click()}
//                       className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all overflow-hidden"
//                     >
//                       <Upload size={18} className="text-indigo-600 flex-shrink-0" />
//                       <span className="text-sm text-slate-500 truncate">
//                         {formData.company_logo
//                           ? formData.company_logo.name
//                           : isEdit ? 'Replace Logo' : 'Upload Logo'}
//                       </span>
//                       <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <MapPin size={14} className="text-slate-400" /> Office Address
//                   </label>
//                   <div className="relative">
//                     <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
//                     <textarea
//                       rows={3} name="office_address" value={formData.office_address} onChange={handleChange}
//                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm"
//                       placeholder="Full office address details..."
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <MessageSquare size={14} className="text-slate-400" /> Customer Note
//                   </label>
//                   <div className="relative">
//                     <MessageSquare size={18} className="absolute left-3 top-3 text-slate-400" />
//                     <textarea
//                       rows={3} name="customer_note" value={formData.customer_note} onChange={handleChange}
//                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm"
//                       placeholder="Additional internal comments..."
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ── ACCOUNT MANAGER ── */}
//           <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
//             <div className="flex items-center gap-2">
//               <UserCheck size={20} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Account Manager</h2>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[
//                 { label: 'Full Name', icon: User, name: 'account_manager_name', placeholder: 'Manager Name' },
//                 { label: 'Designation', icon: UserCheck, name: 'account_manager_designation', placeholder: 'e.g. Senior Manager' },
//                 { label: 'Branch', icon: GitBranch, name: 'account_manager_branch', placeholder: 'Office Branch' },
//                 { label: 'Email Address', icon: Mail, name: 'account_manager_email', type: 'email', placeholder: 'manager@example.com' },
//                 { label: 'Contact Number', icon: Phone, name: 'account_manager_contact', placeholder: '+8801...' },
//                 { label: 'WhatsApp Number', icon: MessageCircle, name: 'account_manager_whatsapp', placeholder: '+8801...' },
//               ].map(({ label, icon: Icon, name, type = 'text', placeholder }) => (
//                 <div key={name} className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Icon size={14} className="text-slate-400" /> {label}
//                   </label>
//                   <input
//                     type={type} name={name} value={formData[name]}
//                     onChange={handleChange} className={inputClass} placeholder={placeholder}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ── SUPPORT / NOC CONTACTS ── */}
//           <div className="space-y-6">
//             <div className="flex items-center gap-2">
//               <ShieldCheck size={20} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Common Support / NOC Contacts</h2>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
//               {[
//                 { field: 'support_emails', label: 'Support Emails', icon: Mail, type: 'email', placeholder: 'support@example.com' },
//                 { field: 'support_mobiles', label: 'Support Numbers', icon: Phone, type: 'text', placeholder: '+8801...' },
//                 { field: 'support_whatsapp_numbers', label: 'WhatsApp Numbers', icon: MessageCircle, type: 'text', placeholder: '+8801...' },
//                 { field: 'support_whatsapp_groups', label: 'WhatsApp Groups', icon: Users, type: 'text', placeholder: 'Invite Link' },
//               ].map(({ field, label, icon: Icon, type, placeholder }) => (
//                 <div key={field} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <Icon size={16} className="text-slate-400" />
//                       <h3 className="font-semibold text-slate-700 text-sm">{label}</h3>
//                     </div>
//                     <button type="button" onClick={() => addCommonField(field)} className="text-indigo-600 hover:text-indigo-700">
//                       <Plus size={18} />
//                     </button>
//                   </div>
//                   <div className="space-y-3">
//                     {formData[field].map((val, index) => (
//                       <div key={index} className="flex gap-2">
//                         <input
//                           type={type} value={val}
//                           onChange={(e) => handleArrayChange(field, index, e.target.value)}
//                           className={inputClass} placeholder={placeholder}
//                         />
//                         {index > 0 && (
//                           <button type="button" onClick={() => removeCommonField(field, index)} className="px-3 bg-red-50 rounded-xl text-red-600">
//                             <Trash2 size={16} />
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ── CONTACT PERSONS ── */}
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <User size={20} className="text-indigo-600" />
//                 <h2 className="text-lg font-bold text-slate-800">Contact Persons</h2>
//               </div>
//               <button
//                 type="button" onClick={addContactPerson}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-sm"
//               >
//                 <Plus size={16} /> Add Contact Person
//               </button>
//             </div>

//             {formData.contact_persons.map((person, personIndex) => {
//               // Skip rendering deleted contact persons
//               if (person._deleted) return null;
              
//               return (
//               <div key={personIndex} className="bg-slate-50 border border-slate-200 rounded-3xl p-8 relative">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center gap-2">
//                     <div className="p-2 bg-white rounded-lg border border-slate-200">
//                       <User size={16} className="text-indigo-600" />
//                     </div>
//                     <h3 className="font-bold text-slate-800">Contact Person #{personIndex + 1}</h3>
//                   </div>
//                   {personIndex > 0 && (
//                     <button type="button" onClick={() => removeContactPerson(personIndex)} className="text-red-500 hover:text-red-700">
//                       <Trash2 size={20} />
//                     </button>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Full Name</label>
//                     <input type="text" value={person.name} onChange={(e) => handleContactPersonChange(personIndex, 'name', e.target.value)} className={inputClass} placeholder="Full Name" />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Designation</label>
//                     <input type="text" value={person.designation} onChange={(e) => handleContactPersonChange(personIndex, 'designation', e.target.value)} className={inputClass} placeholder="Designation" />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Type</label>
//                     <select value={person.contact_type} onChange={(e) => handleContactPersonChange(personIndex, 'contact_type', e.target.value)} className={inputClass}>
//                       <option value="technical">Technical</option>
//                       <option value="sales">Sales</option>
//                       <option value="billing">Billing</option>
//                       <option value="level-1">Level-1</option>
//                     </select>
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Level</label>
//                     <select value={person.contact_level} onChange={(e) => handleContactPersonChange(personIndex, 'contact_level', e.target.value)} className={inputClass}>
//                       {['Level-1','Level-2','Level-3','Level-4','Level-5','Level-6'].map((l) => (
//                         <option key={l} value={l}>{l}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {[
//                     { field: 'emails', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'email@example.com' },
//                     { field: 'mobiles', label: 'Contact Number', icon: Smartphone, type: 'text', placeholder: '+8801...' },
//                     { field: 'whatsapps', label: 'WhatsApp', icon: MessageCircle, type: 'text', placeholder: '+8801...' },
//                   ].map(({ field, label, icon: Icon, type, placeholder }) => (
//                     <div key={field} className="space-y-3">
//                       <div className="flex items-center justify-between">
//                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                           <Icon size={14} className="text-indigo-500" /> {label}
//                         </label>
//                         <button type="button" onClick={() => addContactArrayField(personIndex, field)} className="text-indigo-600 hover:text-indigo-700">
//                           <Plus size={16} />
//                         </button>
//                       </div>
//                       {person[field].map((val, idx) => (
//                         <div key={idx} className="flex gap-2">
//                           <input
//                             type={type} value={val}
//                             onChange={(e) => handleContactArrayChange(personIndex, field, idx, e.target.value)}
//                             className={`${inputClass} !py-2`} placeholder={placeholder}
//                           />
//                           {idx > 0 && (
//                             <button type="button" onClick={() => removeContactArrayField(personIndex, field, idx)} className="text-red-500 p-1">
//                               <Trash2 size={14} />
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             );
//             })}
//           </div>

//           {/* ── ACTIONS ── */}
//           <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
//             <button
//               type="button" onClick={() => navigate('/customers')}
//               className="px-6 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit" disabled={isLoading}
//               className="inline-flex items-center px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all text-sm"
//             >
//               {isLoading
//                 ? <Loader2 size={18} className="animate-spin mr-2" />
//                 : <Save size={18} className="mr-2" />}
//               {isEdit ? 'Update Customer' : 'Save Customer'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CustomerForm;








// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import {
//   ArrowLeft,
//   Save,
//   Loader2,
//   Plus,
//   Trash2,
//   Building2,
//   Globe,
//   Upload,
//   UserCheck,
//   LayoutGrid,
//   Users,
//   ShieldCheck,
// } from 'lucide-react';

// import toast from 'react-hot-toast';
// import api from '../../services/api';

// const CustomerForm = () => {
//   const navigate = useNavigate();

//   const [isLoading, setIsLoading] = useState(false);

//   // ============================================
//   // SAFE UNIQUE ID GENERATOR
//   // ============================================

//   const generateId = () => {
//     return (
//       Date.now().toString(36) +
//       Math.random().toString(36).substring(2, 10)
//     );
//   };

//   // ============================================
//   // STYLES
//   // ============================================

//   const inputClass =
//     'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

//   const iconInputClass =
//     'w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

//   // ============================================
//   // FORM STATE
//   // ============================================

//   const [formData, setFormData] = useState({
//     company_name: '',
//     website: '',
//     office_address: '',
//     customer_note: '',
//     customer_status: 'ACTIVE',

//     company_logo: null,

//     account_manager: {
//       name: '',
//       designation: '',
//       email: '',
//       contact: '',
//       whatsapp: '',
//       branch: '',
//     },

//     support_contacts: [
//       {
//         id: generateId(),
//         type: 'EMAIL',
//         value: '',
//       },
//     ],

//     contact_persons: [
//       {
//         id: generateId(),

//         name: '',
//         designation: '',

//         contact_type: 'TECHNICAL',
//         contact_level: 'LEVEL_1',

//         contacts: [
//           {
//             id: generateId(),
//             type: 'EMAIL',
//             value: '',
//           },
//         ],
//       },
//     ],
//   });

//   // ============================================
//   // BASIC CHANGE
//   // ============================================

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ============================================
//   // ACCOUNT MANAGER
//   // ============================================

//   const handleAccountManagerChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       account_manager: {
//         ...prev.account_manager,
//         [name]: value,
//       },
//     }));
//   };

//   // ============================================
//   // LOGO
//   // ============================================

//   const handleLogoChange = (e) => {
//     const file = e.target.files[0];

//     if (!file) return;

//     setFormData((prev) => ({
//       ...prev,
//       company_logo: file,
//     }));
//   };

//   // ============================================
//   // SUPPORT CONTACTS
//   // ============================================

//   const addSupportContact = () => {
//     setFormData((prev) => ({
//       ...prev,
//       support_contacts: [
//         ...prev.support_contacts,
//         {
//           id: generateId(),
//           type: 'EMAIL',
//           value: '',
//         },
//       ],
//     }));
//   };

//   const removeSupportContact = (id) => {
//     setFormData((prev) => ({
//       ...prev,
//       support_contacts: prev.support_contacts.filter(
//         (item) => item.id !== id
//       ),
//     }));
//   };

//   const handleSupportContactChange = (
//     id,
//     field,
//     value
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       support_contacts: prev.support_contacts.map((item) =>
//         item.id === id
//           ? {
//               ...item,
//               [field]: value,
//             }
//           : item
//       ),
//     }));
//   };

//   // ============================================
//   // CONTACT PERSON
//   // ============================================

//   const addContactPerson = () => {
//     setFormData((prev) => ({
//       ...prev,
//       contact_persons: [
//         ...prev.contact_persons,
//         {
//           id: generateId(),
//           name: '',
//           designation: '',
//           contact_type: 'TECHNICAL',
//           contact_level: 'LEVEL_1',

//           contacts: [
//             {
//               id: generateId(),
//               type: 'EMAIL',
//               value: '',
//             },
//           ],
//         },
//       ],
//     }));
//   };

//   const removeContactPerson = (personId) => {
//     setFormData((prev) => ({
//       ...prev,
//       contact_persons: prev.contact_persons.filter(
//         (person) => person.id !== personId
//       ),
//     }));
//   };

//   const handleContactPersonChange = (
//     personId,
//     field,
//     value
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       contact_persons: prev.contact_persons.map((person) =>
//         person.id === personId
//           ? {
//               ...person,
//               [field]: value,
//             }
//           : person
//       ),
//     }));
//   };

//   // ============================================
//   // PERSON CONTACTS
//   // ============================================

//   const addPersonContact = (personId) => {
//     setFormData((prev) => ({
//       ...prev,
//       contact_persons: prev.contact_persons.map((person) =>
//         person.id === personId
//           ? {
//               ...person,
//               contacts: [
//                 ...person.contacts,
//                 {
//                   id: generateId(),
//                   type: 'EMAIL',
//                   value: '',
//                 },
//               ],
//             }
//           : person
//       ),
//     }));
//   };

//   const removePersonContact = (
//     personId,
//     contactId
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       contact_persons: prev.contact_persons.map((person) =>
//         person.id === personId
//           ? {
//               ...person,
//               contacts: person.contacts.filter(
//                 (contact) => contact.id !== contactId
//               ),
//             }
//           : person
//       ),
//     }));
//   };

//   const handlePersonContactChange = (
//     personId,
//     contactId,
//     field,
//     value
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       contact_persons: prev.contact_persons.map((person) =>
//         person.id === personId
//           ? {
//               ...person,
//               contacts: person.contacts.map((contact) =>
//                 contact.id === contactId
//                   ? {
//                       ...contact,
//                       [field]: value,
//                     }
//                   : contact
//               ),
//             }
//           : person
//       ),
//     }));
//   };

//   // ============================================
//   // SUBMIT
//   // ============================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setIsLoading(true);

//     try {
//       const payload = {
//         company_name: formData.company_name.trim(),
//         website: formData.website.trim(),
//         office_address: formData.office_address.trim(),
//         customer_note: formData.customer_note.trim(),
//         customer_status: formData.customer_status,

//         account_manager: {
//           name: formData.account_manager.name.trim(),
//           designation:
//             formData.account_manager.designation.trim(),
//           email: formData.account_manager.email.trim(),
//           contact: formData.account_manager.contact.trim(),
//           whatsapp: formData.account_manager.whatsapp.trim(),
//           branch: formData.account_manager.branch.trim(),
//         },

//         support_contacts: formData.support_contacts
//           .filter((item) => item.value.trim() !== '')
//           .map((item) => ({
//             type: item.type,
//             value: item.value.trim(),
//           })),

//         contact_persons: formData.contact_persons.map(
//           (person) => ({
//             name: person.name.trim(),
//             designation:
//               person.designation.trim(),

//             contact_type: person.contact_type,
//             contact_level: person.contact_level,

//             contacts: person.contacts
//               .filter(
//                 (contact) =>
//                   contact.value.trim() !== ''
//               )
//               .map((contact) => ({
//                 type: contact.type,
//                 value: contact.value.trim(),
//               })),
//           })
//         ),
//       };

//       console.log('FINAL PAYLOAD:', payload);

//       // ============================================
//       // CREATE CUSTOMER API
//       // ============================================

//       const response = await api.post(
//         '/api/customers',
//         payload
//       );

//       console.log('API RESPONSE:', response.data);

//       // ============================================
//       // CUSTOMER ID SAFE EXTRACTION
//       // ============================================

//       const customerId =
//         response?.data?.data?.customer_id ||
//         response?.data?.customer_id ||
//         response?.data?.id;

//       // ============================================
//       // LOGO UPLOAD
//       // ============================================

//       if (formData.company_logo && customerId) {
//         const logoData = new FormData();

//         logoData.append(
//           'logo',
//           formData.company_logo
//         );

//         await api.post(
//           `/api/customers/${customerId}/logo`,
//           logoData,
//           {
//             headers: {
//               'Content-Type':
//                 'multipart/form-data',
//             },
//           }
//         );
//       }

//       toast.success(
//         'Customer created successfully'
//       );

//       navigate('/customers');
//     } catch (error) {
//       console.error(error);

//       console.log(
//         'ERROR RESPONSE:',
//         error?.response?.data
//       );

//       toast.error(
//         error?.response?.data?.error ||
//           error?.response?.data?.message ||
//           'Failed to create customer'
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ============================================
//   // UI
//   // ============================================

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6">
//       {/* BACK BUTTON */}

//       <button
//         onClick={() => navigate('/customers')}
//         className="inline-flex items-center text-slate-600 hover:text-indigo-600 font-medium transition-colors"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back To Customers
//       </button>

//       {/* CARD */}

//       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
//         {/* HEADER */}

//         <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
//           <div className="flex items-center gap-3">
//             <div className="p-3 rounded-2xl bg-indigo-100">
//               <Building2
//                 className="text-indigo-600"
//                 size={24}
//               />
//             </div>

//             <div>
//               <h1 className="text-2xl font-bold text-slate-900">
//                 Create Customer
//               </h1>

//               <p className="text-sm text-slate-500 mt-1">
//                 Enterprise customer management system
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* FORM */}

//         <form
//           onSubmit={handleSubmit}
//           className="p-8 space-y-10"
//         >
//           {/* COMPANY DETAILS */}

//           <div className="space-y-6">
//             <div className="flex items-center gap-2">
//               <LayoutGrid
//                 size={20}
//                 className="text-indigo-600"
//               />

//               <h2 className="text-lg font-bold text-slate-800">
//                 Company Details
//               </h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* COMPANY NAME */}

//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700">
//                   Company Name
//                 </label>

//                 <input
//                   type="text"
//                   name="company_name"
//                   value={formData.company_name}
//                   onChange={handleChange}
//                   className={inputClass}
//                   required
//                 />
//               </div>

//               {/* WEBSITE */}

//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700">
//                   Website
//                 </label>

//                 <div className="relative">
//                   <Globe
//                     size={18}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <input
//                     type="text"
//                     name="website"
//                     value={formData.website}
//                     onChange={handleChange}
//                     className={iconInputClass}
//                   />
//                 </div>
//               </div>

//               {/* STATUS */}

//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700">
//                   Status
//                 </label>

//                 <select
//                   name="customer_status"
//                   value={formData.customer_status}
//                   onChange={handleChange}
//                   className={inputClass}
//                 >
//                   <option value="ACTIVE">
//                     ACTIVE
//                   </option>

//                   <option value="INACTIVE">
//                     INACTIVE
//                   </option>

//                   <option value="SUSPENDED">
//                     SUSPENDED
//                   </option>

//                   <option value="TERMINATED">
//                     TERMINATED
//                   </option>
//                 </select>
//               </div>

//               {/* LOGO */}

//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700">
//                   Company Logo
//                 </label>

//                 <div className="relative">
//                   <Upload
//                     size={18}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleLogoChange}
//                     className={iconInputClass}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* ADDRESS */}

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">
//                 Office Address
//               </label>

//               <textarea
//                 rows={3}
//                 name="office_address"
//                 value={formData.office_address}
//                 onChange={handleChange}
//                 className={inputClass}
//               />
//             </div>

//             {/* NOTE */}

//             <div className="space-y-1.5">
//               <label className="text-sm font-semibold text-slate-700">
//                 Customer Note
//               </label>

//               <textarea
//                 rows={4}
//                 name="customer_note"
//                 value={formData.customer_note}
//                 onChange={handleChange}
//                 className={inputClass}
//               />
//             </div>
//           </div>

//           {/* ACCOUNT MANAGER */}

//           <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
//             <div className="flex items-center gap-2">
//               <UserCheck
//                 size={20}
//                 className="text-indigo-600"
//               />

//               <h2 className="text-lg font-bold text-slate-800">
//                 Account Manager
//               </h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Manager Name"
//                 value={formData.account_manager.name}
//                 onChange={
//                   handleAccountManagerChange
//                 }
//                 className={inputClass}
//               />

//               <input
//                 type="text"
//                 name="designation"
//                 placeholder="Designation"
//                 value={
//                   formData.account_manager
//                     .designation
//                 }
//                 onChange={
//                   handleAccountManagerChange
//                 }
//                 className={inputClass}
//               />

//               <input
//                 type="text"
//                 name="branch"
//                 placeholder="Branch"
//                 value={
//                   formData.account_manager.branch
//                 }
//                 onChange={
//                   handleAccountManagerChange
//                 }
//                 className={inputClass}
//               />

//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={
//                   formData.account_manager.email
//                 }
//                 onChange={
//                   handleAccountManagerChange
//                 }
//                 className={inputClass}
//               />

//               <input
//                 type="text"
//                 name="contact"
//                 placeholder="Mobile"
//                 value={
//                   formData.account_manager.contact
//                 }
//                 onChange={
//                   handleAccountManagerChange
//                 }
//                 className={inputClass}
//               />

//               <input
//                 type="text"
//                 name="whatsapp"
//                 placeholder="WhatsApp"
//                 value={
//                   formData.account_manager
//                     .whatsapp
//                 }
//                 onChange={
//                   handleAccountManagerChange
//                 }
//                 className={inputClass}
//               />
//             </div>
//           </div>

//           {/* SUPPORT CONTACTS */}

//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <ShieldCheck
//                   size={20}
//                   className="text-indigo-600"
//                 />

//                 <h2 className="text-lg font-bold text-slate-800">
//                   Support Contacts
//                 </h2>
//               </div>

//               <button
//                 type="button"
//                 onClick={addSupportContact}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
//               >
//                 <Plus size={16} />
//                 Add Contact
//               </button>
//             </div>

//             {formData.support_contacts.map(
//               (item) => (
//                 <div
//                   key={item.id}
//                   className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
//                 >
//                   <div className="md:col-span-3">
//                     <select
//                       value={item.type}
//                       onChange={(e) =>
//                         handleSupportContactChange(
//                           item.id,
//                           'type',
//                           e.target.value
//                         )
//                       }
//                       className={inputClass}
//                     >
//                       <option value="EMAIL">
//                         EMAIL
//                       </option>

//                       <option value="MOBILE">
//                         MOBILE
//                       </option>

//                       <option value="WHATSAPP">
//                         WHATSAPP
//                       </option>

//                       <option value="WHATSAPP_GROUP">
//                         WHATSAPP_GROUP
//                       </option>
//                     </select>
//                   </div>

//                   <div className="md:col-span-8">
//                     <input
//                       type="text"
//                       value={item.value}
//                       onChange={(e) =>
//                         handleSupportContactChange(
//                           item.id,
//                           'value',
//                           e.target.value
//                         )
//                       }
//                       className={inputClass}
//                     />
//                   </div>

//                   <div className="md:col-span-1">
//                     <button
//                       type="button"
//                       onClick={() =>
//                         removeSupportContact(
//                           item.id
//                         )
//                       }
//                       className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </div>
//                 </div>
//               )
//             )}
//           </div>

//           {/* CONTACT PERSONS */}

//           <div className="space-y-8">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Users
//                   size={20}
//                   className="text-indigo-600"
//                 />

//                 <h2 className="text-lg font-bold text-slate-800">
//                   Contact Persons
//                 </h2>
//               </div>

//               <button
//                 type="button"
//                 onClick={addContactPerson}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
//               >
//                 <Plus size={16} />
//                 Add Person
//               </button>
//             </div>

//             {formData.contact_persons.map(
//               (person) => (
//                 <div
//                   key={person.id}
//                   className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6"
//                 >
//                   <div className="flex items-center justify-between">
//                     <h3 className="font-bold text-slate-800">
//                       Contact Person
//                     </h3>

//                     <button
//                       type="button"
//                       onClick={() =>
//                         removeContactPerson(
//                           person.id
//                         )
//                       }
//                       className="text-red-600"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     <input
//                       type="text"
//                       placeholder="Name"
//                       value={person.name}
//                       onChange={(e) =>
//                         handleContactPersonChange(
//                           person.id,
//                           'name',
//                           e.target.value
//                         )
//                       }
//                       className={inputClass}
//                     />

//                     <input
//                       type="text"
//                       placeholder="Designation"
//                       value={
//                         person.designation
//                       }
//                       onChange={(e) =>
//                         handleContactPersonChange(
//                           person.id,
//                           'designation',
//                           e.target.value
//                         )
//                       }
//                       className={inputClass}
//                     />

//                     <select
//                       value={
//                         person.contact_type
//                       }
//                       onChange={(e) =>
//                         handleContactPersonChange(
//                           person.id,
//                           'contact_type',
//                           e.target.value
//                         )
//                       }
//                       className={inputClass}
//                     >
//                       <option value="TECHNICAL">
//                         TECHNICAL
//                       </option>

//                       <option value="BILLING">
//                         BILLING
//                       </option>

//                       <option value="SALES">
//                         SALES
//                       </option>

//                       <option value="MANAGEMENT">
//                         MANAGEMENT
//                       </option>
//                     </select>

//                     <select
//                       value={
//                         person.contact_level
//                       }
//                       onChange={(e) =>
//                         handleContactPersonChange(
//                           person.id,
//                           'contact_level',
//                           e.target.value
//                         )
//                       }
//                       className={inputClass}
//                     >
//                       <option value="LEVEL_1">
//                         LEVEL_1
//                       </option>

//                       <option value="LEVEL_2">
//                         LEVEL_2
//                       </option>

//                       <option value="LEVEL_3">
//                         LEVEL_3
//                       </option>

//                       <option value="LEVEL_4">
//                         LEVEL_4
//                       </option>
//                     </select>
//                   </div>

//                   {/* PERSON CONTACTS */}

//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <h4 className="font-semibold text-slate-700">
//                         Contact Details
//                       </h4>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           addPersonContact(
//                             person.id
//                           )
//                         }
//                         className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
//                       >
//                         <Plus size={16} />
//                         Add Contact
//                       </button>
//                     </div>

//                     {person.contacts.map(
//                       (contact) => (
//                         <div
//                           key={contact.id}
//                           className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
//                         >
//                           <div className="md:col-span-3">
//                             <select
//                               value={contact.type}
//                               onChange={(e) =>
//                                 handlePersonContactChange(
//                                   person.id,
//                                   contact.id,
//                                   'type',
//                                   e.target
//                                     .value
//                                 )
//                               }
//                               className={
//                                 inputClass
//                               }
//                             >
//                               <option value="EMAIL">
//                                 EMAIL
//                               </option>

//                               <option value="MOBILE">
//                                 MOBILE
//                               </option>

//                               <option value="WHATSAPP">
//                                 WHATSAPP
//                               </option>
//                             </select>
//                           </div>

//                           <div className="md:col-span-8">
//                             <input
//                               type="text"
//                               value={
//                                 contact.value
//                               }
//                               onChange={(e) =>
//                                 handlePersonContactChange(
//                                   person.id,
//                                   contact.id,
//                                   'value',
//                                   e.target
//                                     .value
//                                 )
//                               }
//                               className={
//                                 inputClass
//                               }
//                             />
//                           </div>

//                           <div className="md:col-span-1">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 removePersonContact(
//                                   person.id,
//                                   contact.id
//                                 )
//                               }
//                               className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
//                             >
//                               <Trash2
//                                 size={18}
//                               />
//                             </button>
//                           </div>
//                         </div>
//                       )
//                     )}
//                   </div>
//                 </div>
//               )
//             )}
//           </div>

//           {/* FOOTER */}

//           <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-4">
//             <button
//               type="button"
//               onClick={() =>
//                 navigate('/customers')
//               }
//               className="px-6 py-2.5 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="inline-flex items-center px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 disabled:opacity-50"
//             >
//               {isLoading ? (
//                 <Loader2
//                   size={18}
//                   className="animate-spin mr-2"
//                 />
//               ) : (
//                 <Save
//                   size={18}
//                   className="mr-2"
//                 />
//               )}

//               Save Customer
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CustomerForm;









// import React, { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// import {
//   ArrowLeft,
//   Save,
//   Loader2,
//   Plus,
//   Trash2,
//   Building2,
//   Globe,
//   MapPin,
//   Upload,
//   UserCheck,
//   MessageSquare,
//   LayoutGrid,
//   Mail,
//   Phone,
//   MessageCircle,
//   Users,
//   ShieldCheck,
//   Smartphone,
//   User,
//   Building,
//   CheckCircle2,
//   GitBranch
// } from 'lucide-react';

// import toast from 'react-hot-toast';
// import api from '../../services/api';

// const CustomerForm = () => {
//   const navigate = useNavigate();
//   const fileInputRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const inputClass =
//     "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

//   const iconInputClass =
//     "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

//   const [formData, setFormData] = useState({
//     company_name: '',
//     company_logo: null,
//     website: '',
//     office_address: '',
//     customer_note: '',
//     customer_status: 'active',

//     account_manager_name: '',
//     account_manager_designation: '',
//     account_manager_email: '',
//     account_manager_contact: '',
//     account_manager_whatsapp: '',
//     account_manager_branch: '',

//     support_emails: [''],
//     support_mobiles: [''],
//     support_whatsapp_numbers: [''],
//     support_whatsapp_groups: [''],

//     contact_persons: [
//       {
//         name: '',
//         designation: '',
//         contact_type: 'technical',
//         contact_level: 'Level-1',
//         emails: [''],
//         mobiles: [''],
//         whatsapps: [''],
//       }
//     ]
//   });

//   // =========================
//   // HANDLERS
//   // =========================
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, company_logo: file }));
//     }
//   };

//   const handleArrayChange = (field, index, value) => {
//     const updated = [...formData[field]];
//     updated[index] = value;
//     setFormData((prev) => ({ ...prev, [field]: updated }));
//   };

//   const addCommonField = (field) => {
//     setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
//   };

//   const removeCommonField = (field, index) => {
//     const updated = [...formData[field]];
//     updated.splice(index, 1);
//     setFormData((prev) => ({ ...prev, [field]: updated }));
//   };

//   const handleContactPersonChange = (index, field, value) => {
//     const updated = [...formData.contact_persons];
//     updated[index][field] = value;
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const handleContactArrayChange = (personIndex, field, arrayIndex, value) => {
//     const updated = [...formData.contact_persons];
//     updated[personIndex][field][arrayIndex] = value;
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const addContactArrayField = (personIndex, field) => {
//     const updated = [...formData.contact_persons];
//     updated[personIndex][field].push('');
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const removeContactArrayField = (personIndex, field, arrayIndex) => {
//     const updated = [...formData.contact_persons];
//     updated[personIndex][field].splice(arrayIndex, 1);
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const addContactPerson = () => {
//     setFormData((prev) => ({
//       ...prev,
//       contact_persons: [
//         ...prev.contact_persons,
//         { 
//           name: '', 
//           designation: '', 
//           contact_type: 'technical', 
//           contact_level: 'Level-1', 
//           emails: [''], 
//           mobiles: [''], 
//           whatsapps: [''] 
//         }
//       ]
//     }));
//   };

//   const removeContactPerson = (index) => {
//     const updated = [...formData.contact_persons];
//     updated.splice(index, 1);
//     setFormData((prev) => ({ ...prev, contact_persons: updated }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const data = new FormData();
//     Object.keys(formData).forEach(key => {
//       if (key === 'contact_persons' || key.includes('support') || key === 'support_whatsapp_groups') {
//         data.append(key, JSON.stringify(formData[key]));
//       } else {
//         data.append(key, formData[key]);
//       }
//     });

//     try {
//       await api.post('/api/customers', data, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });
//       toast.success('Customer created successfully');
//       navigate('/customers');
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Failed to create customer');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6">
//       <button
//         onClick={() => navigate('/customers')}
//         className="inline-flex items-center text-slate-600 hover:text-indigo-600 font-medium transition-colors"
//       >
//         <ArrowLeft size={18} className="mr-2" />
//         Back To Customers
//       </button>

//       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
//           <div className="flex items-center gap-3">
//             <div className="p-3 rounded-2xl bg-indigo-100">
//               <Building2 className="text-indigo-600" size={24} />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-slate-900">Create Customer</h1>
//               <p className="text-sm text-slate-500 mt-1">Manage company profile and customer contact details</p>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
//           {/* COMPANY DETAILS SECTION */}
//           <div className="space-y-6">
//             <div className="flex items-center gap-2 mb-2">
//               <LayoutGrid size={20} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Company Details</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
//               <div className="space-y-4">
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Building size={14} className="text-slate-400" /> Company Name
//                   </label>
//                   <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className={inputClass} placeholder="Example Ltd." />
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <Globe size={14} className="text-slate-400" /> Website
//                   </label>
//                   <div className="relative">
//                     <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                     <input type="text" name="website" value={formData.website} onChange={handleChange} className={iconInputClass} placeholder="https://example.com" />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                       <CheckCircle2 size={14} className="text-slate-400" /> Company Status
//                     </label>
//                     <select name="customer_status" value={formData.customer_status} onChange={handleChange} className={inputClass}>
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                     </select>
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Company Logo</label>
//                     <div 
//                       onClick={() => fileInputRef.current.click()}
//                       className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition-all overflow-hidden"
//                     >
//                       <Upload size={18} className="text-indigo-600 flex-shrink-0" />
//                       <span className="text-sm text-slate-500 truncate">
//                         {formData.company_logo ? formData.company_logo.name : "Upload Logo"}
//                       </span>
//                       <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <MapPin size={14} className="text-slate-400" /> Office Address
//                   </label>
//                   <div className="relative">
//                     <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
//                     <textarea rows={3} name="office_address" value={formData.office_address} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm" placeholder="Full office address details..." />
//                   </div>
//                 </div>

//                 <div className="space-y-1.5">
//                   <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <MessageSquare size={14} className="text-slate-400" /> Customer Note
//                   </label>
//                   <div className="relative">
//                     <MessageSquare size={18} className="absolute left-3 top-3 text-slate-400" />
//                     <textarea rows={3} name="customer_note" value={formData.customer_note} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl resize-none outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm" placeholder="Additional internal comments..." />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ACCOUNT MANAGER SECTION */}
//           <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
//             <div className="flex items-center gap-2">
//               <UserCheck size={20} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Account Manager</h2>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <User size={14} className="text-slate-400" /> Full Name
//                 </label>
//                 <input type="text" name="account_manager_name" value={formData.account_manager_name} onChange={handleChange} className={inputClass} placeholder="Manager Name" />
//               </div>
//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <UserCheck size={14} className="text-slate-400" /> Designation
//                 </label>
//                 <input type="text" name="account_manager_designation" value={formData.account_manager_designation} onChange={handleChange} className={inputClass} placeholder="e.g. Senior Manager" />
//               </div>
//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <GitBranch size={14} className="text-slate-400" /> Branch
//                 </label>
//                 <input type="text" name="account_manager_branch" value={formData.account_manager_branch} onChange={handleChange} className={inputClass} placeholder="Office Branch" />
//               </div>
//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <Mail size={14} className="text-slate-400" /> Email Address
//                 </label>
//                 <input type="email" name="account_manager_email" value={formData.account_manager_email} onChange={handleChange} className={inputClass} placeholder="manager@example.com" />
//               </div>
//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <Phone size={14} className="text-slate-400" /> Contact Number
//                 </label>
//                 <input type="text" name="account_manager_contact" value={formData.account_manager_contact} onChange={handleChange} className={inputClass} placeholder="+8801..." />
//               </div>
//               <div className="space-y-1.5">
//                 <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//                   <MessageCircle size={14} className="text-slate-400" /> WhatsApp Number
//                 </label>
//                 <input type="text" name="account_manager_whatsapp" value={formData.account_manager_whatsapp} onChange={handleChange} className={inputClass} placeholder="+8801..." />
//               </div>
//             </div>
//           </div>

//           {/* COMMON SUPPORT SECTION */}
//           <div className="space-y-6">
//             <div className="flex items-center gap-2">
//               <ShieldCheck size={20} className="text-indigo-600" />
//               <h2 className="text-lg font-bold text-slate-800">Common Support / NOC Contacts</h2>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
//               <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-2">
//                     <Mail size={16} className="text-slate-400" />
//                     <h3 className="font-semibold text-slate-700 text-sm">Support Emails</h3>
//                   </div>
//                   <button type="button" onClick={() => addCommonField('support_emails')} className="text-indigo-600 hover:text-indigo-700"><Plus size={18} /></button>
//                 </div>
//                 <div className="space-y-3">
//                   {formData.support_emails.map((email, index) => (
//                     <div key={index} className="flex gap-2">
//                       <input type="email" value={email} onChange={(e) => handleArrayChange('support_emails', index, e.target.value)} className={inputClass} placeholder="support@example.com" />
//                       {index > 0 && <button type="button" onClick={() => removeCommonField('support_emails', index)} className="px-3 bg-red-50 rounded-xl text-red-600"><Trash2 size={16} /></button>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
              
//               <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-2">
//                     <Phone size={16} className="text-slate-400" />
//                     <h3 className="font-semibold text-slate-700 text-sm">Support Numbers</h3>
//                   </div>
//                   <button type="button" onClick={() => addCommonField('support_mobiles')} className="text-indigo-600 hover:text-indigo-700"><Plus size={18} /></button>
//                 </div>
//                 <div className="space-y-3">
//                   {formData.support_mobiles.map((mobile, index) => (
//                     <div key={index} className="flex gap-2">
//                       <input type="text" value={mobile} onChange={(e) => handleArrayChange('support_mobiles', index, e.target.value)} className={inputClass} placeholder="+8801..." />
//                       {index > 0 && <button type="button" onClick={() => removeCommonField('support_mobiles', index)} className="px-3 bg-red-50 rounded-xl text-red-600"><Trash2 size={16} /></button>}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-2">
//                     <MessageCircle size={16} className="text-slate-400" />
//                     <h3 className="font-semibold text-slate-700 text-sm">WhatsApp Numbers</h3>
//                   </div>
//                   <button type="button" onClick={() => addCommonField('support_whatsapp_numbers')} className="text-indigo-600 hover:text-indigo-700"><Plus size={18} /></button>
//                 </div>
//                 <div className="space-y-3">
//                   {formData.support_whatsapp_numbers.map((item, index) => (
//                     <div key={index} className="flex gap-2">
//                       <input type="text" value={item} onChange={(e) => handleArrayChange('support_whatsapp_numbers', index, e.target.value)} className={inputClass} placeholder="+8801..." />
//                       {index > 0 && <button type="button" onClick={() => removeCommonField('support_whatsapp_numbers', index)} className="px-3 bg-red-50 rounded-xl text-red-600"><Trash2 size={16} /></button>}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-2">
//                     <Users size={16} className="text-slate-400" />
//                     <h3 className="font-semibold text-slate-700 text-sm">WhatsApp Groups</h3>
//                   </div>
//                   <button type="button" onClick={() => addCommonField('support_whatsapp_groups')} className="text-indigo-600 hover:text-indigo-700"><Plus size={18} /></button>
//                 </div>
//                 <div className="space-y-3">
//                   {formData.support_whatsapp_groups.map((group, index) => (
//                     <div key={index} className="flex gap-2">
//                       <input type="text" value={group} onChange={(e) => handleArrayChange('support_whatsapp_groups', index, e.target.value)} className={inputClass} placeholder="Invite Link" />
//                       {index > 0 && <button type="button" onClick={() => removeCommonField('support_whatsapp_groups', index)} className="px-3 bg-red-50 rounded-xl text-red-600"><Trash2 size={16} /></button>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* CONTACT PERSONS SECTION */}
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <User size={20} className="text-indigo-600" />
//                 <h2 className="text-lg font-bold text-slate-800">Contact Persons</h2>
//               </div>
//               <button type="button" onClick={addContactPerson} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
//                 <Plus size={16} /> Add Contact Person
//               </button>
//             </div>

//             {formData.contact_persons.map((person, personIndex) => (
//               <div key={personIndex} className="bg-slate-50 border border-slate-200 rounded-3xl p-8 relative">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center gap-2">
//                     <div className="p-2 bg-white rounded-lg border border-slate-200">
//                       <User size={16} className="text-indigo-600" />
//                     </div>
//                     <h3 className="font-bold text-slate-800 text-md">Contact Person #{personIndex + 1}</h3>
//                   </div>
//                   {personIndex > 0 && (
//                     <button type="button" onClick={() => removeContactPerson(personIndex)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Full Name</label>
//                     <input type="text" value={person.name} onChange={(e) => handleContactPersonChange(personIndex, 'name', e.target.value)} className={inputClass} placeholder="Full Name" />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Designation</label>
//                     <input type="text" value={person.designation} onChange={(e) => handleContactPersonChange(personIndex, 'designation', e.target.value)} className={inputClass} placeholder="Designation" />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Type</label>
//                     <select value={person.contact_type} onChange={(e) => handleContactPersonChange(personIndex, 'contact_type', e.target.value)} className={inputClass}>
//                       <option value="technical">Technical</option>
//                       <option value="sales">Sales</option>
//                       <option value="billing">Billing</option>
//                       <option value="level-1">Level-1</option>
//                     </select>
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-sm font-semibold text-slate-700">Level</label>
//                     <select value={person.contact_level} onChange={(e) => handleContactPersonChange(personIndex, 'contact_level', e.target.value)} className={inputClass}>
//                       <option value="Level-1">Level-1</option>
//                       <option value="Level-2">Level-2</option>
//                       <option value="Level-3">Level-3</option>
//                       <option value="Level-4">Level-4</option>
//                       <option value="Level-5">Level-5</option>
//                       <option value="Level-6">Level-6</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                         <Mail size={14} className="text-indigo-500" /> Email Address
//                       </label>
//                       <button type="button" onClick={() => addContactArrayField(personIndex, 'emails')} className="text-indigo-600 hover:text-indigo-700"><Plus size={16} /></button>
//                     </div>
//                     {person.emails.map((email, idx) => (
//                       <div key={idx} className="flex gap-2">
//                         <input type="email" value={email} onChange={(e) => handleContactArrayChange(personIndex, 'emails', idx, e.target.value)} className={`${inputClass} !py-2 text-sm`} placeholder="email@example.com" />
//                         {idx > 0 && <button type="button" onClick={() => removeContactArrayField(personIndex, 'emails', idx)} className="text-red-500 p-1"><Trash2 size={14} /></button>}
//                       </div>
//                     ))}
//                   </div>

//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                         <Smartphone size={14} className="text-indigo-500" /> Contact Number
//                       </label>
//                       <button type="button" onClick={() => addContactArrayField(personIndex, 'mobiles')} className="text-indigo-600 hover:text-indigo-700"><Plus size={16} /></button>
//                     </div>
//                     {person.mobiles.map((mobile, idx) => (
//                       <div key={idx} className="flex gap-2">
//                         <input type="text" value={mobile} onChange={(e) => handleContactArrayChange(personIndex, 'mobiles', idx, e.target.value)} className={`${inputClass} !py-2 text-sm`} placeholder="+8801..." />
//                         {idx > 0 && <button type="button" onClick={() => removeContactArrayField(personIndex, 'mobiles', idx)} className="text-red-500 p-1"><Trash2 size={14} /></button>}
//                       </div>
//                     ))}
//                   </div>

//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
//                         <MessageCircle size={14} className="text-indigo-500" /> WhatsApp
//                       </label>
//                       <button type="button" onClick={() => addContactArrayField(personIndex, 'whatsapps')} className="text-indigo-600 hover:text-indigo-700"><Plus size={16} /></button>
//                     </div>
//                     {person.whatsapps.map((wa, idx) => (
//                       <div key={idx} className="flex gap-2">
//                         <input type="text" value={wa} onChange={(e) => handleContactArrayChange(personIndex, 'whatsapps', idx, e.target.value)} className={`${inputClass} !py-2 text-sm`} placeholder="+8801..." />
//                         {idx > 0 && <button type="button" onClick={() => removeContactArrayField(personIndex, 'whatsapps', idx)} className="text-red-500 p-1"><Trash2 size={14} /></button>}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
//             <button type="button" onClick={() => navigate('/customers')} className="px-6 py-2.5 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors">Cancel</button>
//             <button type="submit" disabled={isLoading} className="inline-flex items-center px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all">
//               {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
//               Save Customer
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CustomerForm;
