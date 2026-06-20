import React, { useState } from "react";
import { Plus } from "lucide-react";
// Import named uniquely to prevent a collision with your page component
import { datacenters, virtualizationClusters, serviceType, serviceStatus, SSLCertificateTypes, getStatusBadgeClass } from "./useCommonHooks";
import GlobalServiceTable from "./GlobalServicePage";
import ServiceFormModal from "./ServiceFormModal";
import VPSServiceTable from "./VPSServiceTable";
// import DedicatedServiceTable from "./DedicatedServiceTable";
import DedicatedServerServiceTable from "./DedicatedServerServiceTable";
import SSLCertificateTable from "./SSLCertificateTable";
import DomainServiceTable from "./DomainServiceTable";

export default function InfrastructureDashboard() {
  const [activeTab, setActiveTab] = useState("Global Workspace");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [services, setServices] = useState([
    {
      id: 1,
      customer: "ABC Corp",
      project: "ERP System",
      erpID: "ERP-9942",
      serviceCategory: "VPS",
      status: "Active",
      datacenter: "CTG",
      cluster: "ROL Cluster",
      ip: "192.168.0.10",
      primaryvlan: "100",
      secondaryip: "10.0.0.15",
      secondaryvlan: "200",
      vram: "8 GB",
      vdisk: "100 GB",
      vpsid: "VPS-1001",
      comments: "Production database host.",
      pocExpiryDate: "",
      temporarilydisabledDate: "",
      activationDate: "2026-01-15",
      discontinueDate: "2026-05-20",
      discontinueReason: "Migration to dedicated cloud hardware stack."
    },
  ]);

  const openAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSave = (formData) => {
    if (editingItem) {
      setServices((prev) => prev.map((s) => (s.id === editingItem.id ? { ...formData, id: editingItem.id } : s)));
    } else {
      setServices((prev) => [...prev, { ...formData, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans antialiased text-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Infrastructure Service Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Unified matrix for enterprise operations and platform management.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-10 px-4 rounded-lg transition-colors shadow-sm self-end sm:self-auto"
        >
          <Plus size={16} /> Add Infrastructure Asset
        </button>
      </div>

      {/* Primary Context Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 print:hidden overflow-x-auto gap-2">
        {serviceType.map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === type
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Target Route Dispatcher */}
      <div className="space-y-6">
        {activeTab === "Global Workspace" && (
          <GlobalServiceTable
            services={services}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === "VPS" && (
          <VPSServiceTable
            services={services.filter((s) => s.serviceCategory === "VPS")}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        
        {activeTab === "Dedicated Server" && (
          <DedicatedServerServiceTable
            services={services.filter((s) => s.serviceCategory === "Dedicated Server")}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        
        {activeTab === "SSL Certificate" && (
          <SSLCertificateTable
            services={services.filter((s) => s.serviceCategory === "SSL Certificate")}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        
        {activeTab === "Domain" && (
          <DomainServiceTable
            services={services.filter((s) => s.serviceCategory === "Domain")}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {modalOpen && (
        <ServiceFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          editingItem={editingItem}
          initialCategory={activeTab === "Global Workspace" ? "VPS" : activeTab}
        />
      )}
    </div>
  );
}