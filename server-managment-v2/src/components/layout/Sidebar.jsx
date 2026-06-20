import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Smartphone, 
  PlusSquare,
  Building2,
  ContactRound,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown
} from 'lucide-react';

import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ collapsed, setCollapsed }) => {

  const { logout } = useAuth();

  // ✅ load from localStorage (persistent state)
  const getSavedState = () => {

    const saved = localStorage.getItem('sidebar_menus');

    return saved
      ? JSON.parse(saved)
      : {
          users: false,
          devices: false,
          customers: false,
          services: false,
        };
  };

  const [openMenus, setOpenMenus] = useState(getSavedState);

  // ✅ save state on change
  useEffect(() => {
    localStorage.setItem('sidebar_menus', JSON.stringify(openMenus));
  }, [openMenus]);

  // ✅ auto close other menus
  const toggleMenu = (menu) => {

    setOpenMenus((prev) => ({
      users: menu === 'users' ? !prev.users : false,
      devices: menu === 'devices' ? !prev.devices : false,
      customers: menu === 'customers' ? !prev.customers : false,
      services: menu === 'services' ? !prev.services : false,
    }));

  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">

          {!collapsed && (
            <span className="text-xl font-bold tracking-tight">
              Server Managment
            </span>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-800 rounded-md transition-colors"
          >
            {collapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>

        </div>

        {/* MENU */}
        <nav className="flex-1 py-6 px-3 space-y-2">

          {/* ================= DASHBOARD ================= */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center px-4 py-3 rounded-lg transition-all group",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <LayoutDashboard size={20} />

            {!collapsed && (
              <span className="ml-4 font-medium">
                Dashboard
              </span>
            )}
          </NavLink>

          {/* ================= USERS ================= */}
          <div>

            {/* PARENT */}
            <button
              onClick={() => toggleMenu('users')}
              className="flex items-center justify-between w-full px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all"
            >

              <div className="flex items-center">
                <Users size={20} />

                {!collapsed && (
                  <span className="ml-4 font-medium">
                    Users
                  </span>
                )}
              </div>

              {!collapsed && (
                <ChevronDown
                  size={18}
                  className={cn(
                    "transition-transform",
                    openMenus.users ? "rotate-180" : ""
                  )}
                />
              )}

            </button>

            {/* SUB MENU */}
            {openMenus.users && !collapsed && (

              <div className="ml-10 mt-2 space-y-2">

                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )
                  }
                >
                  <Users size={16} />
                  <span className="ml-3">User List</span>
                </NavLink>

                <NavLink
                  to="/users/create"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )
                  }
                >
                  <UserPlus size={16} />
                  <span className="ml-3">Add User</span>
                </NavLink>

              </div>
            )}

          </div>

          {/* ================= DEVICES ================= */}
          <div>

            {/* PARENT */}
            <button
              onClick={() => toggleMenu('devices')}
              className="flex items-center justify-between w-full px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all"
            >

              <div className="flex items-center">
                <Smartphone size={20} />

                {!collapsed && (
                  <span className="ml-4 font-medium">
                    Devices
                  </span>
                )}
              </div>

              {!collapsed && (
                <ChevronDown
                  size={18}
                  className={cn(
                    "transition-transform",
                    openMenus.devices ? "rotate-180" : ""
                  )}
                />
              )}

            </button>

            {/* SUB MENU */}
            {openMenus.devices && !collapsed && (

              <div className="ml-10 mt-2 space-y-2">

                <NavLink
                  to="/devices"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )
                  }
                >
                  <Smartphone size={16} />
                  <span className="ml-3">Device List</span>
                </NavLink>

                <NavLink
                  to="/devices/add"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )
                  }
                >
                  <PlusSquare size={16} />
                  <span className="ml-3">Add Device</span>
                </NavLink>

              </div>
            )}

          </div>

          {/* ================= CUSTOMERS ================= */}
          <div>

            {/* PARENT */}
            <button
              onClick={() => toggleMenu('customers')}
              className="flex items-center justify-between w-full px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all"
            >

              <div className="flex items-center">
                <Building2 size={20} />

                {!collapsed && (
                  <span className="ml-4 font-medium">
                    Customers
                  </span>
                )}
              </div>

              {!collapsed && (
                <ChevronDown
                  size={18}
                  className={cn(
                    "transition-transform",
                    openMenus.customers ? "rotate-180" : ""
                  )}
                />
              )}

            </button>

            {/* SUB MENU */}
            {openMenus.customers && !collapsed && (

              <div className="ml-10 mt-2 space-y-2">

                {/* CUSTOMER LIST */}
                <NavLink
                  to="/customers"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )
                  }
                >
                  <Building2 size={16} />
                  <span className="ml-3">Customer List</span>
                </NavLink>

                {/* ADD CUSTOMER */}
                <NavLink
                  to="/customers/add"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )
                  }
                >
                  <PlusSquare size={16} />
                  <span className="ml-3">Add Customer</span>
                </NavLink>

              </div>
            )}

          </div>




              {/* ================= SERVICES ================= */}
              <div>

                {/* PARENT */}
                <button
                  onClick={() => toggleMenu('services')}
                  className="flex items-center justify-between w-full px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all"
                >
                  <div className="flex items-center">
                    <Building2 size={20} />

                    {!collapsed && (
                      <span className="ml-4 font-medium">
                        Services
                      </span>
                    )}
                  </div>

                  {!collapsed && (
                    <ChevronDown
                      size={18}
                      className={cn(
                        "transition-transform",
                        openMenus.services ? "rotate-180" : ""
                      )}
                    />
                  )}
                </button>

                {/* SUB MENU */}
                {openMenus.services && !collapsed && (
                  <div className="ml-10 mt-2 space-y-2">

                    {/* SERVICE LIST PAGE */}
                    <NavLink
                      to="/services"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center px-3 py-2 rounded-lg text-sm",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )
                      }
                    >
                      <Building2 size={16} />
                      <span className="ml-3">Service List</span>
                    </NavLink>


                   {/* SERVICE LIST PAGE */}
                    <NavLink
                      to="/ServiceViewPage"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center px-3 py-2 rounded-lg text-sm",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )
                      }
                    >
                      <Building2 size={16} />
                      <span className="ml-3">Service View</span>
                    </NavLink>

                    {/* ADD SERVICE PAGE */}
                    <NavLink
                      to="/services/add"
                      className={({ isActive }) =>
                        cn(
                          "flex items-center px-3 py-2 rounded-lg text-sm",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )
                      }
                    >
                      <PlusSquare size={16} />
                      <span className="ml-3">Add Service</span>
                    </NavLink>

                  </div>
                )}
                </div>

        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="flex items-center p-6 border-t border-slate-800 text-slate-400 hover:text-red-400 transition-colors w-full"
        >

          <LogOut size={20} />

          {!collapsed && (
            <span className="ml-4 font-medium">
              Logout
            </span>
          )}

        </button>

      </div>
    </aside>
  );
};

export default Sidebar;
