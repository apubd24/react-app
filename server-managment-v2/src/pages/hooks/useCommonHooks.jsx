import React, { useMemo, useState } from "react";

export const hardwareModels = ["Dell PowerEdge R630", "Dell PowerEdge R640", "Dell EMC PowerEdge R740"];
export const hardwarecategorys = ["SERVER", "ROUTER", "SWITCH", "FIREWALL", "OLT"];
export const hardwareHeights = ["1U", "2U", "3U", "4U", "5U", "6U", "7U", "8U"];
export const snmpGroups = ["POWEREDGE", "EPON", "GPON"];
export const snmpVersions = ["v1", "v2c", "v3"];
export const datacenters = ["Khaza Tower 9F", "Venture Tower", "Jessore", "Khulna", "CTG", "Bogura", "Sylhet"];
// 1. Structural Datacenter to Rack Mapping Matrix
export const racksByDatacenter = {
  "Khaza Tower 9F": ["R1R1", "R1R2", "R1R3", "R1R4", "R1R5", "R2R1", "R2R2", "R2R3", "R2R4", "R2R5", "R3R1", "R3R2", "R3R3", "R3R4", "R3R5"],
  "Venture Tower": ["R1R1", "R1R2", "R1R3", "R1R4", "R1R5", "R2R1", "R2R2", "R2R3", "R2R4", "R2R5", "R3R1", "R3R2", "R3R3", "R3R4", "R3R5"],
  "Jessore": ["Rack-C1", "Rack-C2"],
  "Khulna": ["Rack-K1", "Rack-K2"],
  "CTG": ["Rack-CT1", "Rack-CT2"],
  "Bogura": ["Rack-B1", "Rack-B2"],
  "Sylhet": ["Rack-S1", "Rack-S2"],
};


//Server Node Types
export const deviceTypes = ["Standalone", "Multi Node"];

export const multiNodeDevices = ["8Node Supermicro-1", "8Node Supermicro-2", "8Node Supermicro-3", "8Node Supermicro-4", "8Node Supermicro-5", "12Node Supermicro-1", "24Node Supermicro-1", "4Node Dell-1", "4Node Dell-2"];
export const standaloneDevices = ["Dell PowerEdge R630", "Dell PowerEdge R640", "Dell EMC PowerEdge R740"];

export const rackPositions = Array.from({ length: 42 }, (_, i) => `U${i + 1}`);
export const rackName = ["R1R1", "R1R2", "R1R3", "R1R4", "R1R5", "R2R1", "R2R2", "R2R3", "R2R4", "R2R5", "R3R1", "R3R2", "R3R3", "R3R4", "R3R5"];
export const assetStatusOptions = ["Live", "Team Store", "In Store", "Available", "Reserved", "Maintenance", "Faulty - Returned to store", "Lost", "Lifecycle Expired"];
export const teamStoreLocations = ["Dhaka Khaja", "Dhaka Venture", "Dhaka DC 1", "Jessore DC"];
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