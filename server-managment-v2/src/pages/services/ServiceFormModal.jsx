import React, { useState, useEffect } from "react";
import { X, Layers, Server, Globe } from "lucide-react";
import { datacenters, virtualizationClusters, serviceType, serviceStatus, operatingSystemlist, SSLCertificateTypes, hardwareModels } from "./useCommonHooks";

// Imported custom Axios instance configuration wrapper
import api from '../../services/api';

export function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[38px]"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function ServiceFormModal({ isOpen, onClose, onSave, editingItem, initialCategory }) {
  const [customers, setCustomers] = useState([]);
  const [devices, setdevices] = useState([]);


  
  // Clean Form State Architecture tracking database relationships cleanly
  const defaultFormState = {
    serviceId: "",
    customerId: "", // Relational link to customer DB table
    projectName: "",
    erpID: "",
    serviceCategory: initialCategory || "VPS",
    status: "Active",
    activationDate: "",
    discontinueDate: "",
    discontinueReason: "",
    temporarilydisabledDate: "",
    temporarilydisabledReason: "",
    pocExpiryDate: "",
    comments: "",
    operatingSystem: "",
    // VPS parameters
    vpsid: "", datacenter: "", cluster: "", vcpu: "", vram: "", vdisk: "", additionaldisk: "", primaryvlan: "", primaryip: "", secondaryvlan: "", secondaryip: "",
    
    // Dedicated Servers parameters
    serverId: "", hardwareModel: "", rackLocation: "", rackPosition: "", cpuModel: "", physicalCores: "", physicalRam: "", storageLayout: "",  secondaryIp: "", mgmtVlan: "", mgmtIp: "", primarySwitchPort: "", secondarySwitchPort: "",
    
    // SSL / Domains fields
    domain: "", certificateType: "", expiryDate: ""
  };

  const [form, setForm] = useState(defaultFormState);
  const [clusterSearch, setClusterSearch] = useState("");



  

  // Fetch real database customer listings safely using the configured Axios wrapper
  useEffect(() => {
    if (isOpen) {
      api.get("/api/customers/dropdown")
        .then((res) => {
          if (res.data && Array.isArray(res.data.data)) { 
            setCustomers(res.data.data); 
          }
        })
        .catch((err) => console.error("Error retrieving core customer listing matrices:", err));
    }
  }, [isOpen]);



  // Fetch real database devices listings safely using the configured Axios wrapper
  useEffect(() => {
    if (isOpen) {
      api.get("/api/devices/dropdown")
        .then((res) => {
          if (res.data && Array.isArray(res.data.data)) { 
            setdevices(res.data.data); 
          }
        })
        .catch((err) => console.error("Error retrieving core customer listing matrices:", err));
    }
  }, [isOpen]);



  useEffect(() => {
    if (editingItem) {
      // Maps backend structural schema structures smoothly into matching flat UI layout definitions
      const flatForm = {
        ...editingItem,
        ...editingItem.vpsDetails,
        ...editingItem.dedicatedDetails,
        ...editingItem.sslDetails,
        ...editingItem.domainDetails,
        serviceCategory: editingItem.serviceCategory || initialCategory
      };
      
      // Parse dates safely from database to HTML input elements format (YYYY-MM-DD)
      const parseDate = (dStr) => dStr ? dStr.split("T")[0] : "";
      flatForm.activationDate = parseDate(flatForm.activationDate);
      flatForm.discontinueDate = parseDate(flatForm.discontinueDate);
      flatForm.temporarilydisabledDate = parseDate(flatForm.temporarilydisabledDate);
      flatForm.pocExpiryDate = parseDate(flatForm.pocExpiryDate);
      flatForm.expiryDate = parseDate(flatForm.expiryDate);

      setForm(flatForm);
    } else {
      setForm({ ...defaultFormState, serviceCategory: initialCategory || "VPS" });
    }
    setClusterSearch("");
  }, [editingItem, initialCategory, isOpen]);

  const filteredClusters = virtualizationClusters.filter((c) =>
    c.toLowerCase().includes((clusterSearch || "").toLowerCase())
  );

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!form.customerId) {
      alert("Please assign a customer to link this infrastructure record.");
      return;
    }

    // Pack raw flattening form configurations accurately back into sub-objects expected by Go structs
    const payload = {
      serviceId: form.serviceId || undefined,
      customerId: parseInt(form.customerId, 10),
      projectName: form.projectName,
      erpID: form.erpID,
      serviceCategory: form.serviceCategory,
      status: form.status,
      activationDate: form.activationDate ? new Date(form.activationDate).toISOString() : null,
      discontinueDate: form.status === "Discontinued" && form.discontinueDate ? new Date(form.discontinueDate).toISOString() : null,
      discontinueReason: form.status === "Discontinued" ? form.discontinueReason : "",
      temporarilydisabledDate: form.status === "Temporarily disabled" && form.temporarilydisabledDate ? new Date(form.temporarilydisabledDate).toISOString() : null,
      temporarilydisabledReason: form.status === "Temporarily disabled" ? form.temporarilydisabledReason : "",
      pocExpiryDate: form.status === "POC" && form.pocExpiryDate ? new Date(form.pocExpiryDate).toISOString() : null,
      comments: form.comments,
    };

    if (form.serviceCategory === "VPS") {
      payload.vpsDetails = {
        vpsid: form.vpsid, datacenter: form.datacenter, cluster: form.cluster, vcpu: form.vcpu, vram: form.vram, vdisk: form.vdisk,
        additionaldisk: form.additionaldisk, operatingSystem: form.operatingSystem, primaryvlan: form.primaryvlan, primaryip: form.primaryip, secondaryvlan: form.secondaryvlan, secondaryip: form.secondaryip
      };
    } else if (form.serviceCategory === "Dedicated Server") {
      payload.dedicatedDetails = {
        serverId: form.serverId, hardwareModel: form.hardwareModel, rackLocation: form.rackLocation, rackPosition: form.rackPosition,
        cpuModel: form.cpuModel, physicalCores: form.physicalCores, physicalRam: form.physicalRam, storageLayout: form.storageLayout, operatingSystem: form.operatingSystem,
        primaryvlan: form.primaryvlan, primaryip: form.primaryip, primarySwitchName: form.primarySwitchName, primarySwitchPort: form.primarySwitchPort,
        secondaryvlan: form.secondaryvlan, secondaryip: form.secondaryip, secondarySwitchName: form.secondarySwitchName, secondarySwitchPort: form.secondarySwitchPort, 
        mgmtVlan: form.mgmtVlan, mgmtIp: form.mgmtIp
      };
    } else if (form.serviceCategory === "SSL Certificate") {
      payload.sslDetails = {
        domain: form.domain, certificateType: form.certificateType,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null
      };
    } else if (form.serviceCategory === "Domain") {
      payload.domainDetails = {
        domain: form.domain,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null
      };
    }

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all">
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">
            {editingItem ? `Modify Asset Architecture (${form.serviceId})` : "Provision Infrastructure Record"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* PART 1: COMMON CORE FIELDS */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-100">
              Core Lifecycle Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Dynamic Customer Dropdown Fetching List Layer */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Customer Name</label>
                <select 
                  value={form.customerId} 
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]"
                >
                  <option value="">Select Connected Client</option>
                  {customers.map((c) => (
                    // Fixed property lookup key from c.name to match database schema key: c.company_name
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Project Name" value={form.projectName} onChange={(v) => setForm({ ...form, projectName: v })} placeholder="e.g., Core Nexus Gateway" />
              <Input label="ERP Reference ID" value={form.erpID} onChange={(v) => setForm({ ...form, erpID: v })} placeholder="e.g., ERP-5501" />
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Service Type</label>
                <select 
                  disabled={!!editingItem} // Avoid mutating ID prefixes on existing elements mid-flight
                  value={form.serviceCategory} 
                  onChange={(e) => setForm({ ...form, serviceCategory: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {serviceType.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Service Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
                  {serviceStatus.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <Input label="Activation Date" type="date" value={form.activationDate} onChange={(v) => setForm({ ...form, activationDate: v })} />
            </div>
          </div>

          {/* PART 2: STATUS-BASED DYNAMIC CONDITIONAL FIELDS */}
          {form.status === "POC" && (
            <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-4">
              <div className="text-xs font-bold text-blue-500 uppercase tracking-wider border-b border-blue-100/60 pb-1">POC Configuration</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="POC Operational Deadline" type="date" value={form.pocExpiryDate} onChange={(v) => setForm({ ...form, pocExpiryDate: v })} />
              </div>
            </div>
          )}

          {form.status === "Temporarily disabled" && (
            <div className="p-4 border border-amber-100 bg-amber-50/30 rounded-xl space-y-4">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider border-b border-amber-100/60 pb-1">Temporary Suspension Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Disability Execution Date" type="date" value={form.temporarilydisabledDate} onChange={(v) => setForm({ ...form, temporarilydisabledDate: v })} />
                <Input label="Suspension Context / Reason" value={form.temporarilydisabledReason} onChange={(v) => setForm({ ...form, temporarilydisabledReason: v })} placeholder="Reason for temporary disability..." />
              </div>
            </div>
          )}

          {form.status === "Discontinued" && (
            <div className="p-4 border border-rose-100 bg-rose-50/30 rounded-xl space-y-4">
              <div className="text-xs font-bold text-rose-500 uppercase tracking-wider border-b border-rose-100/60 pb-1">Decommissioning Context</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Asset Lifecycle Termination Date" type="date" value={form.discontinueDate} onChange={(v) => setForm({ ...form, discontinueDate: v })} />
                <Input label="Termination Context / Reason" value={form.discontinueReason} onChange={(v) => setForm({ ...form, discontinueReason: v })} placeholder="Reason for decommissioning..." />
              </div>
            </div>
          )}

          {/* PART 3: ASSET SPECIFIC METRICS BLOCKS */}
          {form.serviceCategory === "VPS" && (
            <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Layers size={14} /> Virtual Server Metrics</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="VPS ID" placeholder="e.g., VPS-1001" value={form.vpsid} onChange={(v) => setForm({ ...form, vpsid: v })} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Target Datacenter</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]" value={form.datacenter} onChange={(e) => setForm({ ...form, datacenter: e.target.value })}>
                    <option value="">Select Datacenter</option>
                    {datacenters.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Virtualization Cluster</label>
                  <select value={form.cluster || ""} onChange={(e) => setForm({ ...form, cluster: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
                    <option value="">Select Cluster</option>
                    {filteredClusters.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Input label="VCPU (Core)" placeholder="e.g., 4" value={form.vcpu} onChange={(v) => setForm({ ...form, vcpu: v })} />
                <Input label="VRAM (GB)" placeholder="e.g., 8" value={form.vram} onChange={(v) => setForm({ ...form, vram: v })} />
                <Input label="VDISK (GB)" placeholder="e.g., 100" value={form.vdisk} onChange={(v) => setForm({ ...form, vdisk: v })} />
                <Input label="Additional Disk (GB)" placeholder="e.g., 50" value={form.additionaldisk} onChange={(v) => setForm({ ...form, additionaldisk: v })} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Operating System (OS)</label>
                  <select value={form.operatingSystem || ""} onChange={(e) => setForm({ ...form, operatingSystem: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
                    <option value="">Select Operating System</option>
                    {operatingSystemlist.map((os) => <option key={os} value={os}>{os}</option>)}
                  </select>
                </div>
                <Input label="Primary VLAN" placeholder="e.g., 100" value={form.primaryvlan} onChange={(v) => setForm({ ...form, primaryvlan: v })} />
                <Input label="Primary IP Address" placeholder="e.g., 192.168.0.10" value={form.ip} onChange={(v) => setForm({ ...form, ip: v })} />
                <Input label="Secondary VLAN" placeholder="e.g., 200" value={form.secondaryvlan} onChange={(v) => setForm({ ...form, secondaryvlan: v })} />
                <Input label="Secondary IP Address" placeholder="e.g., 10.0.0.15" value={form.secondaryip} onChange={(v) => setForm({ ...form, secondaryip: v })} />
              </div>
            </div>
          )}

          {form.serviceCategory === "Dedicated Server" && (
            <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Server size={14} /> Dedicated Hardware & Bare Metal Metrics</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Target Datacenter</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]" value={form.datacenter} onChange={(e) => setForm({ ...form, datacenter: e.target.value })}>
                    <option value="">Select Datacenter</option>
                    {datacenters.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {/* <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Chassis / Hardware Model</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]" value={form.hardwareModel} onChange={(e) => setForm({ ...form, hardwareModel: e.target.value })}>
                    <option value="">Select Hardware Model</option>
                    {hardwareModels.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div> */}
                {/* Dynamic Assigned Hardware Dropdown Fetching List Layer */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">
                    Assigned Hardware
                  </label>

                  {/* <select 
                    value={form.DeviceID} 
                    onChange={(e) => setForm({ ...form, DeviceID: e.target.value })} 
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]"
                  >
                    <option value="">Select Connected Device</option>
                    {devices.map((device) => (
                      // FIXED: Changed device.DeviceName to device.device_name to match your JSON data structure
                      <option key={device.id} value={device.id}>
                        {device.device_name}
                      </option>
                    ))}
                  </select> */}
                  <select
                    value={form.DeviceID}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                    
                      const selectedDevice = devices.find(
                        (d) => d.id === selectedId
                      );
                    
                      setForm({
                        ...form,
                        DeviceID: selectedId,
                        hardwareSerial: selectedDevice?.serial || "",
                        hardwareVendor: selectedDevice?.device_vendor || "",
                        hardwareModel: selectedDevice?.hardware_model || "",
                      });
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]"
                  >
                    <option value="">Select Connected Device</option>
                  
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.device_name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input label="Asset Tag / Server ID" value={form.hardwareSerial} onChange={(v) => setForm({ ...form, hardwareSerial: v })}/>
                <Input label="Hardware Vendor" value={form.hardwareVendor} onChange={(v) => setForm({ ...form, hardwareVendor: v })} />
                <Input label="Hardware Model" value={form.hardwareModel} onChange={(v) => setForm({ ...form, hardwareModel: v })} />
                <Input label="Rack Location" placeholder="Rack R3R13" value={form.rackLocation} onChange={(v) => setForm({ ...form, rackLocation: v })} />
                <Input label="Rack Position" placeholder="U14-U15" value={form.rackPosition} onChange={(v) => setForm({ ...form, rackPosition: v })} />
                <Input label="Processor (CPU Model)" placeholder="e.g., Intel Xeon Silver 4314" value={form.cpuModel} onChange={(v) => setForm({ ...form, cpuModel: v })} />
                <Input label="Physical CPU Cores / Threads" placeholder="e.g., 32 Cores / 64 Threads" value={form.physicalCores} onChange={(v) => setForm({ ...form, physicalCores: v })} />
                <Input label="Physical RAM Configuration" placeholder="e.g., 256GB DDR5 ECC" value={form.physicalRam} onChange={(v) => setForm({ ...form, physicalRam: v })} />
                <Input label="Storage Layout & RAID level" placeholder="e.g., 2x 960GB NVMe (RAID 1)" value={form.storageLayout} onChange={(v) => setForm({ ...form, storageLayout: v })} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Operating System (OS)</label>
                  <select value={form.operatingSystem || ""} onChange={(e) => setForm({ ...form, operatingSystem: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
                    <option value="">Select Operating System</option>
                    {operatingSystemlist.map((os) => <option key={os} value={os}>{os}</option>)}
                  </select>
                </div>                
                <Input label="Primary VLAN" placeholder="e.g., 100" value={form.primaryvlan} onChange={(v) => setForm({ ...form, primaryvlan: v })} />
                <Input label="Primary IP Address" placeholder="e.g., 192.168.0.10" value={form.ip} onChange={(v) => setForm({ ...form, ip: v })} />
                <Input label="Switch Name (Primary)" placeholder="e.g., 10.0.0.20" value={form.primarySwitchName} onChange={(v) => setForm({ ...form, primarySwitchName: v })} />
                <Input label="Switch Port / Uplink (Primary)" placeholder="e.g., GigabitEthernet1/0/1" value={form.primarySwitchPort} onChange={(v) => setForm({ ...form, primarySwitchPort: v })} />
                <Input label="Secondary VLAN" placeholder="e.g., 200" value={form.secondaryvlan} onChange={(v) => setForm({ ...form, secondaryvlan: v })} />
                <Input label="Secondary IP Address" placeholder="e.g., 10.0.0.15" value={form.secondaryIp} onChange={(v) => setForm({ ...form, secondaryIp: v })} />
                <Input label="Switch Name (Secondary)" placeholder="e.g., 10.0.0.21" value={form.secondarySwitchName} onChange={(v) => setForm({ ...form, secondarySwitchName: v })} />
                <Input label="Switch Port / Uplink (Secondary)" placeholder="e.g., GigabitEthernet1/0/2" value={form.secondarySwitchPort} onChange={(v) => setForm({ ...form, secondarySwitchPort: v })} />
                <Input label="MGMT / IPMI / iLO VLAN" placeholder="e.g., 300" value={form.mgmtVlan} onChange={(v) => setForm({ ...form, mgmtVlan: v })} />
                <Input label="MGMT / IPMI / iLO IP Address" placeholder="e.g., 10.0.0.20" value={form.mgmtIp} onChange={(v) => setForm({ ...form, mgmtIp: v })} />
              </div>
            </div>
          )}

          {form.serviceCategory === "SSL Certificate" && (
            <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Globe size={14} /> Certificate Security Info</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Domain Name" placeholder="e.g., example.com" value={form.domain} onChange={(v) => setForm({ ...form, domain: v })} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">SSL Certificate Type</label>
                  <select value={form.certificateType || ""} onChange={(e) => setForm({ ...form, certificateType: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
                    <option value="">Select Certificate Type</option>
                    {SSLCertificateTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={(v) => setForm({ ...form, expiryDate: v })} />
              </div>
            </div>
          )}

          {form.serviceCategory === "Domain" && (
            <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Globe size={14} /> Domain Registrar Info</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Domain Name" placeholder="e.g., example.com" value={form.domain} onChange={(v) => setForm({ ...form, domain: v })} />
                <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={(v) => setForm({ ...form, expiryDate: v })} />
              </div>
            </div>
          )}

          {/* Bottom Comments Section */}
          <div className="flex flex-col gap-1 pt-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Comments / Notes</label>
            <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" placeholder="Enter system architecture notes..." value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium h-10 px-4 rounded-lg transition-colors">Cancel</button>
          <button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-10 px-4 rounded-lg transition-colors shadow-sm">Apply Changes</button>
        </div>
      </div>
    </div>
  );
}




// import React, { useState, useEffect } from "react";
// import { X, Layers, Server, Globe } from "lucide-react";
// import { datacenters, virtualizationClusters, serviceType, serviceStatus, SSLCertificateTypes } from "./useCommonHooks";

// // Assuming you have your standard API utility wrapper setup somewhere
// // Example import axios or fetch helpers:
// // import { apiFetch } from "./api"; 

// import toast from 'react-hot-toast';
// import api from '../../services/api';

// export function Input({ label, value, onChange, placeholder, type = "text" }) {
//   return (
//     <div className="flex flex-col gap-1">
//       <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">{label}</label>
//       <input
//         type={type}
//         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[38px]"
//         placeholder={placeholder}
//         value={value || ""}
//         onChange={(e) => onChange(e.target.value)}
//       />
//     </div>
//   );
// }

// export default function ServiceFormModal({ isOpen, onClose, onSave, editingItem, initialCategory }) {
//   const [customers, setCustomers] = useState([]);
  
//   // Clean Form State Architecture tracking database relationships cleanly
//   const defaultFormState = {
//     serviceId: "",
//     customerId: "", // Relational link to customer DB table
//     projectName: "",
//     erpID: "",
//     serviceCategory: initialCategory || "VPS",
//     status: "Active",
//     activationDate: "",
//     discontinueDate: "",
//     discontinueReason: "",
//     temporarilydisabledDate: "",
//     temporarilydisabledReason: "",
//     pocExpiryDate: "",
//     comments: "",
    
//     // VPS parameters
//     vpsid: "", datacenter: "", cluster: "", vcpu: "", vram: "", vdisk: "", additionaldisk: "", primaryvlan: "", ip: "", secondaryvlan: "", secondaryip: "",
    
//     // Dedicated Servers parameters
//     serverId: "", hardwareModel: "", rackLocation: "", rackPosition: "", cpuModel: "", physicalCores: "", physicalRam: "", storageLayout: "", secondaryIp: "", mgmtVlan: "", mgmtIp: "", primarySwitchPort: "", secondarySwitchPort: "",
    
//     // SSL / Domains fields
//     domain: "", certificateType: "", expiryDate: ""
//   };

//   const [form, setForm] = useState(defaultFormState);
//   const [clusterSearch, setClusterSearch] = useState("");

//   // Fetch real database customer listings safely on window init
//   useEffect(() => {
//     if (isOpen) {
//       // replace with your implementation tracking: apiFetch("/customers")
//       fetch("/customers/dropdown", {
//         headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
//       })
//         .then((res) => res.json())
//         .then((data) => { if (Array.isArray(data)) setCustomers(data); })
//         .catch((err) => console.error("Error retrieving core customer listing matrices:", err));
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (editingItem) {
//       // Maps backend structural schema structures smoothly into matching flat UI layout definitions
//       const flatForm = {
//         ...editingItem,
//         ...editingItem.vpsDetails,
//         ...editingItem.dedicatedDetails,
//         ...editingItem.sslDetails,
//         ...editingItem.domainDetails,
//         serviceCategory: editingItem.serviceCategory || initialCategory
//       };
      
//       // Parse dates safely from database to HTML input elements format (YYYY-MM-DD)
//       const parseDate = (dStr) => dStr ? dStr.split("T")[0] : "";
//       flatForm.activationDate = parseDate(flatForm.activationDate);
//       flatForm.discontinueDate = parseDate(flatForm.discontinueDate);
//       flatForm.temporarilydisabledDate = parseDate(flatForm.temporarilydisabledDate);
//       flatForm.pocExpiryDate = parseDate(flatForm.pocExpiryDate);
//       flatForm.expiryDate = parseDate(flatForm.expiryDate);

//       setForm(flatForm);
//     } else {
//       setForm({ ...defaultFormState, serviceCategory: initialCategory || "VPS" });
//     }
//     setClusterSearch("");
//   }, [editingItem, initialCategory, isOpen]);

//   const filteredClusters = virtualizationClusters.filter((c) =>
//     c.toLowerCase().includes((clusterSearch || "").toLowerCase())
//   );

//   const handleSubmit = (e) => {
//     if (e) e.preventDefault();
//     if (!form.customerId) {
//       alert("Please assign a customer to link this infrastructure record.");
//       return;
//     }

//     // Pack raw flattening form configurations accurately back into sub-objects expected by Go structs
//     const payload = {
//       serviceId: form.serviceId || undefined,
//       customerId: parseInt(form.customerId, 10),
//       projectName: form.projectName,
//       erpID: form.erpID,
//       serviceCategory: form.serviceCategory,
//       status: form.status,
//       activationDate: form.activationDate ? new Date(form.activationDate).toISOString() : null,
//       discontinueDate: form.status === "Discontinued" && form.discontinueDate ? new Date(form.discontinueDate).toISOString() : null,
//       discontinueReason: form.status === "Discontinued" ? form.discontinueReason : "",
//       temporarilydisabledDate: form.status === "Temporarily disabled" && form.temporarilydisabledDate ? new Date(form.temporarilydisabledDate).toISOString() : null,
//       temporarilydisabledReason: form.status === "Temporarily disabled" ? form.temporarilydisabledReason : "",
//       pocExpiryDate: form.status === "POC" && form.pocExpiryDate ? new Date(form.pocExpiryDate).toISOString() : null,
//       comments: form.comments,
//     };

//     if (form.serviceCategory === "VPS") {
//       payload.vpsDetails = {
//         vpsid: form.vpsid, datacenter: form.datacenter, cluster: form.cluster, vcpu: form.vcpu, vram: form.vram, vdisk: form.vdisk,
//         additionaldisk: form.additionaldisk, primaryvlan: form.primaryvlan, ip: form.ip, secondaryvlan: form.secondaryvlan, secondaryip: form.secondaryip
//       };
//     } else if (form.serviceCategory === "Dedicated Server") {
//       payload.dedicatedDetails = {
//         serverId: form.serverId, hardwareModel: form.hardwareModel, rackLocation: form.rackLocation, rackPosition: form.rackPosition,
//         cpuModel: form.cpuModel, physicalCores: form.physicalCores, physicalRam: form.physicalRam, storageLayout: form.storageLayout,
//         primaryvlan: form.primaryvlan, ip: form.ip, secondaryvlan: form.secondaryvlan, secondaryIp: form.secondaryIp,
//         mgmtVlan: form.mgmtVlan, mgmtIp: form.mgmtIp, primarySwitchPort: form.primarySwitchPort, secondarySwitchPort: form.secondarySwitchPort
//       };
//     } else if (form.serviceCategory === "SSL Certificate") {
//       payload.sslDetails = {
//         domain: form.domain, certificateType: form.certificateType,
//         expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null
//       };
//     } else if (form.serviceCategory === "Domain") {
//       payload.domainDetails = {
//         domain: form.domain,
//         expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null
//       };
//     }

//     onSave(payload);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <div className="bg-white border border-gray-100 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all">
        
//         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
//           <h2 className="text-lg font-bold text-gray-900">
//             {editingItem ? `Modify Asset Architecture (${form.serviceId})` : "Provision Infrastructure Record"}
//           </h2>
//           <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//             <X size={18} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          
//           {/* PART 1: COMMON CORE FIELDS */}
//           <div className="space-y-4">
//             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-100">
//               Core Lifecycle Information
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
//               {/* Dynamic Customer Dropdown Fetching List Layer */}
//               <div className="flex flex-col gap-1">
//                 <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Customer Name</label>
//                 <select 
//                   value={form.customerId} 
//                   onChange={(e) => setForm({ ...form, customerId: e.target.value })} 
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]"
//                 >
//                   <option value="">Select Connected Client</option>
//                   {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
//                 </select>
//               </div>

//               <Input label="Project Name" value={form.projectName} onChange={(v) => setForm({ ...form, projectName: v })} placeholder="e.g., Core Nexus Gateway" />
//               <Input label="ERP Reference ID" value={form.erpID} onChange={(v) => setForm({ ...form, erpID: v })} placeholder="e.g., ERP-5501" />
              
//               <div className="flex flex-col gap-1">
//                 <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Service Type</label>
//                 <select 
//                   disabled={!!editingItem} // Avoid mutating ID prefixes on existing elements mid-flight
//                   value={form.serviceCategory} 
//                   onChange={(e) => setForm({ ...form, serviceCategory: e.target.value })} 
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px] disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 >
//                   {serviceType.map((t) => <option key={t} value={t}>{t}</option>)}
//                 </select>
//               </div>

//               <div className="flex flex-col gap-1">
//                 <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Service Status</label>
//                 <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
//                   {serviceStatus.map((s) => <option key={s} value={s}>{s}</option>)}
//                 </select>
//               </div>

//               <Input label="Activation Date" type="date" value={form.activationDate} onChange={(v) => setForm({ ...form, activationDate: v })} />
//             </div>
//           </div>

//           {/* PART 2: STATUS-BASED DYNAMIC CONDITIONAL FIELDS */}
//           {form.status === "POC" && (
//             <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-4">
//               <div className="text-xs font-bold text-blue-500 uppercase tracking-wider border-b border-blue-100/60 pb-1">POC Configuration</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="POC Operational Deadline" type="date" value={form.pocExpiryDate} onChange={(v) => setForm({ ...form, pocExpiryDate: v })} />
//               </div>
//             </div>
//           )}

//           {form.status === "Temporarily disabled" && (
//             <div className="p-4 border border-amber-100 bg-amber-50/30 rounded-xl space-y-4">
//               <div className="text-xs font-bold text-amber-600 uppercase tracking-wider border-b border-amber-100/60 pb-1">Temporary Suspension Details</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Disability Execution Date" type="date" value={form.temporarilydisabledDate} onChange={(v) => setForm({ ...form, temporarilydisabledDate: v })} />
//                 <Input label="Suspension Context / Reason" value={form.temporarilydisabledReason} onChange={(v) => setForm({ ...form, temporarilydisabledReason: v })} placeholder="Reason for temporary disability..." />
//               </div>
//             </div>
//           )}

//           {form.status === "Discontinued" && (
//             <div className="p-4 border border-rose-100 bg-rose-50/30 rounded-xl space-y-4">
//               <div className="text-xs font-bold text-rose-500 uppercase tracking-wider border-b border-rose-100/60 pb-1">Decommissioning Context</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Asset Lifecycle Termination Date" type="date" value={form.discontinueDate} onChange={(v) => setForm({ ...form, discontinueDate: v })} />
//                 <Input label="Termination Context / Reason" value={form.discontinueReason} onChange={(v) => setForm({ ...form, discontinueReason: v })} placeholder="Reason for decommissioning..." />
//               </div>
//             </div>
//           )}

//           {/* PART 3: ASSET SPECIFIC METRICS BLOCKS */}
//           {form.serviceCategory === "VPS" && (
//             <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
//               <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Layers size={14} /> Virtual Server Metrics</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="VPS ID" placeholder="e.g., VPS-1001" value={form.vpsid} onChange={(v) => setForm({ ...form, vpsid: v })} />
//                 <div className="flex flex-col gap-1">
//                   <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Target Datacenter</label>
//                   <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]" value={form.datacenter} onChange={(e) => setForm({ ...form, datacenter: e.target.value })}>
//                     <option value="">Select Datacenter</option>
//                     {datacenters.map((d) => <option key={d} value={d}>{d}</option>)}
//                   </select>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Virtualization Cluster</label>
//                   <select value={form.cluster || ""} onChange={(e) => setForm({ ...form, cluster: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
//                     <option value="">Select Cluster</option>
//                     {filteredClusters.map((c) => <option key={c} value={c}>{c}</option>)}
//                   </select>
//                 </div>
//                 <Input label="VCPU (Core)" placeholder="e.g., 4" value={form.vcpu} onChange={(v) => setForm({ ...form, vcpu: v })} />
//                 <Input label="VRAM (GB)" placeholder="e.g., 8" value={form.vram} onChange={(v) => setForm({ ...form, vram: v })} />
//                 <Input label="VDISK (GB)" placeholder="e.g., 100" value={form.vdisk} onChange={(v) => setForm({ ...form, vdisk: v })} />
//                 <Input label="Additional Disk (GB)" placeholder="e.g., 50" value={form.additionaldisk} onChange={(v) => setForm({ ...form, additionaldisk: v })} />
//                 <Input label="Primary VLAN" placeholder="e.g., 100" value={form.primaryvlan} onChange={(v) => setForm({ ...form, primaryvlan: v })} />
//                 <Input label="Primary IP Address" placeholder="e.g., 192.168.0.10" value={form.ip} onChange={(v) => setForm({ ...form, ip: v })} />
//                 <Input label="Secondary VLAN" placeholder="e.g., 200" value={form.secondaryvlan} onChange={(v) => setForm({ ...form, secondaryvlan: v })} />
//                 <Input label="Secondary IP Address" placeholder="e.g., 10.0.0.15" value={form.secondaryip} onChange={(v) => setForm({ ...form, secondaryip: v })} />
//               </div>
//             </div>
//           )}

//           {form.serviceCategory === "Dedicated Server" && (
//             <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
//               <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Server size={14} /> Dedicated Hardware & Bare Metal Metrics</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Asset Tag / Server ID" placeholder="e.g., DS-1001" value={form.serverId} onChange={(v) => setForm({ ...form, serverId: v })} />
//                 <div className="flex flex-col gap-1">
//                   <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Target Datacenter</label>
//                   <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]" value={form.datacenter} onChange={(e) => setForm({ ...form, datacenter: e.target.value })}>
//                     <option value="">Select Datacenter</option>
//                     {datacenters.map((d) => <option key={d} value={d}>{d}</option>)}
//                   </select>
//                 </div>
//                 <Input label="Chassis / Hardware Model" placeholder="Dell R750" value={form.hardwareModel} onChange={(v) => setForm({ ...form, hardwareModel: v })} />
//                 <Input label="Rack Location" placeholder="Rack R3R13" value={form.rackLocation} onChange={(v) => setForm({ ...form, rackLocation: v })} />
//                 <Input label="Rack Position" placeholder="U14-U15" value={form.rackPosition} onChange={(v) => setForm({ ...form, rackPosition: v })} />
//                 <Input label="Processor (CPU Model)" placeholder="e.g., Intel Xeon Silver 4314" value={form.cpuModel} onChange={(v) => setForm({ ...form, cpuModel: v })} />
//                 <Input label="Physical CPU Cores / Threads" placeholder="e.g., 32 Cores / 64 Threads" value={form.physicalCores} onChange={(v) => setForm({ ...form, physicalCores: v })} />
//                 <Input label="Physical RAM Configuration" placeholder="e.g., 256GB DDR5 ECC" value={form.physicalRam} onChange={(v) => setForm({ ...form, physicalRam: v })} />
//                 <Input label="Storage Layout & RAID level" placeholder="e.g., 2x 960GB NVMe (RAID 1)" value={form.storageLayout} onChange={(v) => setForm({ ...form, storageLayout: v })} />
//                 <Input label="Primary VLAN" placeholder="e.g., 100" value={form.primaryvlan} onChange={(v) => setForm({ ...form, primaryvlan: v })} />
//                 <Input label="Primary IP Address" placeholder="e.g., 192.168.0.10" value={form.ip} onChange={(v) => setForm({ ...form, ip: v })} />
//                 <Input label="Secondary VLAN" placeholder="e.g., 200" value={form.secondaryvlan} onChange={(v) => setForm({ ...form, secondaryvlan: v })} />
//                 <Input label="Secondary IP Address" placeholder="e.g., 10.0.0.15" value={form.secondaryIp} onChange={(v) => setForm({ ...form, secondaryIp: v })} />
//                 <Input label="OOB / IPMI / iLO VLAN" placeholder="e.g., 300" value={form.mgmtVlan} onChange={(v) => setForm({ ...form, mgmtVlan: v })} />
//                 <Input label="OOB / IPMI / iLO IP Address" placeholder="e.g., 10.0.0.20" value={form.mgmtIp} onChange={(v) => setForm({ ...form, mgmtIp: v })} />
//                 <Input label="Switch Port / Uplink (Primary)" placeholder="e.g., GigabitEthernet1/0/1" value={form.primarySwitchPort} onChange={(v) => setForm({ ...form, primarySwitchPort: v })} />
//                 <Input label="Switch Port / Uplink (Secondary)" placeholder="e.g., GigabitEthernet1/0/2" value={form.secondarySwitchPort} onChange={(v) => setForm({ ...form, secondarySwitchPort: v })} />
//               </div>
//             </div>
//           )}

//           {form.serviceCategory === "SSL Certificate" && (
//             <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
//               <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Globe size={14} /> Certificate Security Info</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Domain Name" placeholder="e.g., example.com" value={form.domain} onChange={(v) => setForm({ ...form, domain: v })} />
//                 <div className="flex flex-col gap-1">
//                   <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">SSL Certificate Type</label>
//                   <select value={form.certificateType || ""} onChange={(e) => setForm({ ...form, certificateType: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
//                     <option value="">Select Certificate Type</option>
//                     {SSLCertificateTypes.map((t) => <option key={t} value={t}>{t}</option>)}
//                   </select>
//                 </div>
//                 <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={(v) => setForm({ ...form, expiryDate: v })} />
//               </div>
//             </div>
//           )}

//           {form.serviceCategory === "Domain" && (
//             <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
//               <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Globe size={14} /> Domain Registrar Info</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Domain Name" placeholder="e.g., example.com" value={form.domain} onChange={(v) => setForm({ ...form, domain: v })} />
//                 <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={(v) => setForm({ ...form, expiryDate: v })} />
//               </div>
//             </div>
//           )}

//           {/* Bottom Comments Section */}
//           <div className="flex flex-col gap-1 pt-2">
//             <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Comments / Notes</label>
//             <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" placeholder="Enter system architecture notes..." value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
//           </div>
//         </form>

//         <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
//           <button type="button" onClick={onClose} className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium h-10 px-4 rounded-lg transition-colors">Cancel</button>
//           <button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-10 px-4 rounded-lg transition-colors shadow-sm">Apply Changes</button>
//         </div>
//       </div>
//     </div>
//   );
// }














// import React, { useState, useEffect } from "react";
// import { X, Layers, Server, Globe } from "lucide-react";
// import { datacenters, virtualizationClusters, serviceType, serviceStatus, SSLCertificateTypes } from "./useCommonHooks";

// import toast from 'react-hot-toast';
// import api from '../../services/api';

// export function Input({ label, value, onChange, placeholder, type = "text" }) {
//   return (
//     <div className="flex flex-col gap-1">
//       <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">{label}</label>
//       <input
//         type={type}
//         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[38px]"
//         placeholder={placeholder}
//         value={value || ""}
//         onChange={(e) => onChange(e.target.value)}
//       />
//     </div>
//   );
// }

// export default function ServiceFormModal({ isOpen, onClose, onSave, editingItem, initialCategory }) {
//   const [form, setForm] = useState({
//     customer: "", project: "", erpID: "", serviceCategory: initialCategory, status: "Active",
//     datacenter: "", cluster: "", clusterSearch: "", ip: "", domain: "", vram: "", vdisk: "",
//     vpsid: "", vcpu: "", additionaldisk: "", primaryvlan: "", secondaryvlan: "", secondaryip: "",
//     comments: "", pocExpiryDate: "", temporarilydisabledDate: "", temporarilydisabledReason: "", activationDate: "",
//     discontinueDate: "", discontinueReason: "", serverId: "", hardwareModel: "", rackLocation: "",
//     rackPosition: "", cpuModel: "", physicalCores: "", physicalRam: "", storageLayout: "",
//     secondaryIp: "", mgmtVlan: "", mgmtIp: "", primarySwitchPort: "", secondarySwitchPort: "",
//     certificateType: "", expiryDate: ""
//   });

//   useEffect(() => {
//     if (editingItem) {
//       setForm({ ...editingItem, clusterSearch: "" });
//     } else {
//       setForm((p) => ({ ...p, serviceCategory: initialCategory }));
//     }
//   }, [editingItem, initialCategory]);

//   const filteredClusters = virtualizationClusters.filter((c) =>
//     c.toLowerCase().includes((form.clusterSearch || "").toLowerCase())
//   );

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const finalForm = {
//       ...form,
//       pocExpiryDate: form.status === "POC" ? form.pocExpiryDate : "",
//       temporarilydisabledDate: form.status === "Temporarily disabled" ? form.temporarilydisabledDate : "",
//       temporarilydisabledReason: form.status === "Temporarily disabled" ? form.temporarilydisabledReason : "",
//       discontinueDate: (form.status === "Discontinued" || form.discontinueDate) ? form.discontinueDate : "",
//       discontinueReason: form.status === "Discontinued" ? form.discontinueReason : ""
//     };
//     onSave(finalForm);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
//       <div className="bg-white border border-gray-100 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all">
//         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
//           <h2 className="text-lg font-bold text-gray-900">{editingItem ? "Modify Asset Architecture" : "Provision Infrastructure Record"}</h2>
//           <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          
//           {/* =========================================================
//               PART 1: COMMON CORE FIELDS (Structured in 2 Columns)
//              ========================================================= */}
//           <div className="space-y-4">
//             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-100">
//               Core Lifecycle Information
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Input label="Customer Name" value={form.customer} onChange={(v) => setForm({ ...form, customer: v })} placeholder="e.g., Nexus Stream" />
//               <Input label="Project Name" value={form.project} onChange={(v) => setForm({ ...form, project: v })} placeholder="e.g., Core Nexus Gateway" />
//               <Input label="ERP Reference ID" value={form.erpID} onChange={(v) => setForm({ ...form, erpID: v })} placeholder="e.g., ERP-5501" />
              
//               <div className="flex flex-col gap-1">
//                 <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Service Type</label>
//                 <select value={form.serviceCategory} onChange={(e) => setForm({ ...form, serviceCategory: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
//                   {serviceType.map((t) => <option key={t} value={t}>{t}</option>)}
//                 </select>
//               </div>

//               <div className="flex flex-col gap-1">
//                 <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Service Status</label>
//                 <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
//                   {serviceStatus.map((s) => <option key={s} value={s}>{s}</option>)}
//                 </select>
//               </div>

//               <Input label="Activation Date" type="date" value={form.activationDate} onChange={(v) => setForm({ ...form, activationDate: v })} />
//               {/* <Input label="Discontinue Date" type="date" value={form.discontinueDate} onChange={(v) => setForm({ ...form, discontinueDate: v })} /> */}
//             </div>
//           </div>

//           {/* =========================================================
//               PART 2: STATUS-BASED DYNAMIC CONDITIONAL FIELDS
//              ========================================================= */}
          
//           {/* Conditional Rule: Status is POC */}
//           {form.status === "POC" && (
//             <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-4 animate-fade-in">
//               <div className="text-xs font-bold text-blue-500 uppercase tracking-wider border-b border-blue-100/60 pb-1">POC Configuration</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="POC Operational Deadline" type="date" value={form.pocExpiryDate} onChange={(v) => setForm({ ...form, pocExpiryDate: v })} />
//               </div>
//             </div>
//           )}

//           {/* Conditional Rule: Status is Temporarily disabled */}
//           {form.status === "Temporarily disabled" && (
//             <div className="p-4 border border-amber-100 bg-amber-50/30 rounded-xl space-y-4 animate-fade-in">
//               <div className="text-xs font-bold text-amber-600 uppercase tracking-wider border-b border-amber-100/60 pb-1">Temporary Suspension Details</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Disability Execution Date" type="date" value={form.temporarilydisabledDate} onChange={(v) => setForm({ ...form, temporarilydisabledDate: v })} />
//                 <Input label="Suspension Context / Reason" value={form.temporarilydisabledReason} onChange={(v) => setForm({ ...form, temporarilydisabledReason: v })} placeholder="Reason for temporary disability..." />
//               </div>
//             </div>
//           )}

//           {/* Conditional Rule: Status is Discontinued */}
//           {form.status === "Discontinued" && (
//             <div className="p-4 border border-rose-100 bg-rose-50/30 rounded-xl space-y-4 animate-fade-in">
//               <div className="text-xs font-bold text-rose-500 uppercase tracking-wider border-b border-rose-100/60 pb-1">Decommissioning Context</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Asset Lifecycle Termination Date" type="date" value={form.discontinueDate} onChange={(v) => setForm({ ...form, discontinueDate: v })} />
//                 <Input label="Termination Context / Reason" value={form.discontinueReason} onChange={(v) => setForm({ ...form, discontinueReason: v })} placeholder="Reason for decommissioning..." />
//               </div>
//             </div>
//           )}

//           {/* =========================================================
//               PART 3: ASSET SPECIFIC METRICS BLOCK (Kept intact)
//              ========================================================= */}

//           {form.serviceCategory === "VPS" && (
//             <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
//               <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Layers size={14} /> Virtual Server Metrics</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="VPS ID" placeholder="e.g., VPS-1001" value={form.vpsid} onChange={(v) => setForm({ ...form, vpsid: v })} />
//                 <Input label="Service ID" placeholder="e.g., DS-1001" value={form.serviceId} onChange={(v) => setForm({ ...form, serviceId: v })} />
//                 <div className="flex flex-col gap-1">
//                   <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Target Datacenter</label>
//                   <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]" value={form.datacenter} onChange={(e) => setForm({ ...form, datacenter: e.target.value })}>
//                     <option value="">Select Datacenter</option>
//                     {datacenters.map((d) => <option key={d} value={d}>{d}</option>)}
//                   </select>
//                 </div>
//                 <div className="flex flex-col gap-1">
//                   <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Virtualization Cluster</label>
//                   <select value={form.cluster || ""} onChange={(e) => setForm({ ...form, cluster: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
//                     <option value="">Select Cluster</option>
//                     {filteredClusters.map((c) => <option key={c} value={c}>{c}</option>)}
//                   </select>
//                 </div>
//                 <Input label="VCPU (Core)" placeholder="e.g., 4" value={form.vcpu} onChange={(v) => setForm({ ...form, vcpu: v })} />
//                 <Input label="VRAM (GB)" placeholder="e.g., 8" value={form.vram} onChange={(v) => setForm({ ...form, vram: v })} />
//                 <Input label="VDISK (GB)" placeholder="e.g., 100" value={form.vdisk} onChange={(v) => setForm({ ...form, vdisk: v })} />
//                 <Input label="Additional Disk (GB)" placeholder="e.g., 50" value={form.additionaldisk} onChange={(v) => setForm({ ...form, additionaldisk: v })} />
//                 <Input label="Primary VLAN" placeholder="e.g., 100" value={form.primaryvlan} onChange={(v) => setForm({ ...form, primaryvlan: v })} />
//                 <Input label="Primary IP Address" placeholder="e.g., 192.168.0.10" value={form.ip} onChange={(v) => setForm({ ...form, ip: v })} />
//                 <Input label="Secondary VLAN" placeholder="e.g., 200" value={form.secondaryvlan} onChange={(v) => setForm({ ...form, secondaryvlan: v })} />
//                 <Input label="Secondary IP Address" placeholder="e.g., 10.0.0.15" value={form.secondaryip} onChange={(v) => setForm({ ...form, secondaryip: v })} />
//               </div>
//             </div>
//           )}

//           {form.serviceCategory === "Dedicated Server" && (
//             <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
//               <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Server size={14} /> Dedicated Hardware & Bare Metal Metrics</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Service ID" placeholder="e.g., DS-1001" value={form.serviceId} onChange={(v) => setForm({ ...form, serviceId: v })} />
//                 <Input label="Asset Tag / Server ID" placeholder="e.g., DS-1001" value={form.serverId} onChange={(v) => setForm({ ...form, serverId: v })} />
//                 <div className="flex flex-col gap-1">
//                   <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Target Datacenter</label>
//                   <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]" value={form.datacenter} onChange={(e) => setForm({ ...form, datacenter: e.target.value })}>
//                     <option value="">Select Datacenter</option>
//                     {datacenters.map((d) => <option key={d} value={d}>{d}</option>)}
//                   </select>
//                 </div>
//                 <Input label="Chassis / Hardware Model" placeholder="Dell R750" value={form.hardwareModel} onChange={(v) => setForm({ ...form, hardwareModel: v })} />
//                 <Input label="Rack Location" placeholder="Rack R3R13" value={form.rackLocation} onChange={(v) => setForm({ ...form, rackLocation: v })} />
//                 <Input label="Rack Position" placeholder="U14-U15" value={form.rackPosition} onChange={(v) => setForm({ ...form, rackPosition: v })} />
//                 <Input label="Processor (CPU Model)" placeholder="e.g., Intel Xeon Silver 4314" value={form.cpuModel} onChange={(v) => setForm({ ...form, cpuModel: v })} />
//                 <Input label="Physical CPU Cores / Threads" placeholder="e.g., 32 Cores / 64 Threads" value={form.physicalCores} onChange={(v) => setForm({ ...form, physicalCores: v })} />
//                 <Input label="Physical RAM Configuration" placeholder="e.g., 256GB DDR5 ECC" value={form.physicalRam} onChange={(v) => setForm({ ...form, physicalRam: v })} />
//                 <Input label="Storage Layout & RAID level" placeholder="e.g., 2x 960GB NVMe (RAID 1)" value={form.storageLayout} onChange={(v) => setForm({ ...form, storageLayout: v })} />
//                 <Input label="Primary VLAN" placeholder="e.g., 100" value={form.primaryvlan} onChange={(v) => setForm({ ...form, primaryvlan: v })} />
//                 <Input label="Primary IP Address" placeholder="e.g., 192.168.0.10" value={form.ip} onChange={(v) => setForm({ ...form, ip: v })} />
//                 <Input label="Secondary VLAN" placeholder="e.g., 200" value={form.secondaryvlan} onChange={(v) => setForm({ ...form, secondaryvlan: v })} />
//                 <Input label="Secondary IP Address" placeholder="e.g., 10.0.0.15" value={form.secondaryIp} onChange={(v) => setForm({ ...form, secondaryIp: v })} />
//                 <Input label="OOB / IPMI / iLO VLAN" placeholder="e.g., 300" value={form.mgmtVlan} onChange={(v) => setForm({ ...form, mgmtVlan: v })} />
//                 <Input label="OOB / IPMI / iLO IP Address" placeholder="e.g., 10.0.0.20" value={form.mgmtIp} onChange={(v) => setForm({ ...form, mgmtIp: v })} />
//                 <Input label="Switch Port / Uplink (Primary)" placeholder="e.g., GigabitEthernet1/0/1" value={form.primarySwitchPort} onChange={(v) => setForm({ ...form, primarySwitchPort: v })} />
//                 <Input label="Switch Port / Uplink (Secondary)" placeholder="e.g., GigabitEthernet1/0/2" value={form.secondarySwitchPort} onChange={(v) => setForm({ ...form, secondarySwitchPort: v })} />
//               </div>
//             </div>
//           )}

//           {form.serviceCategory === "SSL Certificate" && (
//             <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
//               <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Globe size={14} /> Certificate Security Info</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Service ID" placeholder="e.g., SSL-1001" value={form.serviceId} onChange={(v) => setForm({ ...form, serviceId: v })} />
//                 <Input label="Domain Name" placeholder="e.g., example.com" value={form.domain} onChange={(v) => setForm({ ...form, domain: v })} />
//                 <div className="flex flex-col gap-1">
//                   <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">SSL Certificate Type</label>
//                   <select value={form.certificateType || ""} onChange={(e) => setForm({ ...form, certificateType: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[38px]">
//                     <option value="">Select Certificate Type</option>
//                     {SSLCertificateTypes.map((t) => <option key={t} value={t}>{t}</option>)}
//                   </select>
//                 </div>
//                 <Input label="Expiry Date" type="date" placeholder="e.g., 2023-12-31" value={form.expiryDate} onChange={(v) => setForm({ ...form, expiryDate: v })} />
//               </div>
//             </div>
//           )}

//           {form.serviceCategory === "Domain" && (
//             <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
//               <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2"><Globe size={14} /> Domain Registrar Info</div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Input label="Service ID" placeholder="e.g., Domain-1001" value={form.serviceId} onChange={(v) => setForm({ ...form, serviceId: v })} />
//                 <Input label="Domain Name" placeholder="e.g., example.com" value={form.domain} onChange={(v) => setForm({ ...form, domain: v })} />
//                 <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={(v) => setForm({ ...form, expiryDate: v })} />
//               </div>
//             </div>
//           )}

//           {/* Bottom Comments / Notes Section */}
//           <div className="flex flex-col gap-1 pt-2">
//             <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Comments / Notes</label>
//             <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" placeholder="Enter system architecture notes..." value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
//           </div>
//         </form>

//         <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
//           <button type="button" onClick={onClose} className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium h-10 px-4 rounded-lg transition-colors">Cancel</button>
//           <button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-10 px-4 rounded-lg transition-colors shadow-sm">Apply Changes</button>
//         </div>
//       </div>
//     </div>
//   );
// }

