import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import ChangePassword from './pages/users/ChangePassword';
import UserCreate from './pages/users/UserCreate';
// Device Management

// import DeviceList from './pages/devices/DeviceList';
import DeviceManagment from './pages/devices/DeviceManagment';
import DeviceForm from './pages/devices/DeviceForm';
import DeviceView from './pages/devices/DeviceView';

// Customers
import CustomerForm from './pages/customers/CustomerForm';
import CustomerManagment from './pages/customers/CustomerManagment';

//Services
import ServiceManagement from './pages/services/ServiceManagement';
import ServiceViewPage from './pages/services/ServiceViewPage';

// Services


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* User Management */}
              <Route path="/users" element={<UserList />} />
              <Route path="/users/add" element={<UserForm />} />
              <Route path="/users/edit/:id" element={<UserForm />} />
              <Route path="/users/change-password/:id" element={<ChangePassword />} />
              <Route path="/users/create" element={<UserCreate />} />

              
              {/* Device Management */}
              <Route path="/devices" element={<DeviceManagment />} />
              <Route path="/devices/add" element={<DeviceForm />} />
              <Route path="/devices/edit/:id" element={<DeviceForm />} />
              <Route path="/devices/view/:id" element={<DeviceView />} />

            {/*Cusromers Managment */}
            <Route path="/customers" element={<CustomerManagment />} />
            <Route path="/customers/add" element={<CustomerForm />} />
            <Route path="/customers/:id/edit" element={<CustomerForm />} />

            {/* Services Managment */}
            <Route path="/services" element={<ServiceManagement />} />
            <Route path="/services/add" element={<ServiceManagement />} />
            <Route path="/services/:id/edit" element={<ServiceManagement />} />
            <Route path="/ServiceViewPage" element={<ServiceViewPage />} />

            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
