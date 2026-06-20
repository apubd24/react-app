import React, { useMemo, useState } from "react";

export const hardwareModels = ["Dell PowerEdge R630", "Dell PowerEdge R640", "Dell PowerEdge R750"];
export const datacenters = ["Khaza Tower", "Venture Tower", "Jessore", "Khulna", "CTG", "Bogura", "Sylhet"];
export const operatingSystemlist = ["Windows Server 2019", "Windows Server 2022", "Ubuntu 20.04 LTS", "Ubuntu 22.04 LTS", "CentOS 7", "CentOS 8", "Debian 10", "Debian 11"];
export const virtualizationClusters = ["ROL Cluster", "DhakaColo Cluster", "DhakaColo Cluster 2"];
export const serviceType = ["Global Workspace", "VPS", "Dedicated Server", "SSL Certificate", "Domain"];
export const serviceStatus = ["Active", "Discontinued", "Pending", "Suspended", "Archived", "POC", "In Progress", "Temporarily disabled"];
export const SSLCertificateTypes = ["Comodo PositiveSSL", "Comodo EssentialSSL", "Comodo PremiumSSL", "Comodo EV SSL", "Let's Encrypt", "DigiCert Standard SSL", "DigiCert EV SSL", "GoDaddy Standard SSL", "GoDaddy EV SSL", "RapidSSL", "DV", "OV", "EV"];



export function getStatusBadgeClass(status) {
  switch (status) {
    case "Active": return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "Discontinued": return "bg-gray-100 text-gray-700 border-gray-200";
    case "Pending": return "bg-blue-50 text-blue-700 border-blue-100";
    case "Suspended": return "bg-rose-50 text-rose-700 border-rose-100";
    case "Archived": return "bg-purple-50 text-purple-700 border-purple-100";
    case "POC": return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "In Progress": return "bg-amber-50 text-amber-700 border-amber-100";
    case "Temporarily disabled": return "bg-zinc-100 text-zinc-700 border-zinc-300";
    default: return "bg-gray-50 text-gray-600 border-gray-100";
  }
}