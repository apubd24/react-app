import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { cn } from '../../lib/utils';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <main 
        className={cn(
          "flex-1 transition-all duration-300 flex flex-col",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <Navbar />
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
