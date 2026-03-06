import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import AppShell from './components/layout/AppShell';
import Splash from './screens/auth/Splash';
import Onboarding from './screens/auth/Onboarding';

import Home from './screens/dashboards/Home';
import Wallet from './screens/dashboards/Wallet';
import Profile from './screens/dashboards/Profile';
import Insights from './screens/dashboards/Insights';

import FlowsList from './screens/flows/FlowsList';
import CreateFlow from './screens/flows/CreateFlow';
import FlowDetails from './screens/flows/FlowDetails';

import ScanPay from './screens/transactions/ScanPay';
import Activity from './screens/transactions/Activity';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  if (!currentUser) return <Navigate to="/onboarding" />;
  return <AppShell>{children}</AppShell>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Private Routes wrapped in App Shell */}
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
          <Route path="/scan" element={<PrivateRoute><ScanPay /></PrivateRoute>} />
          <Route path="/flows" element={<PrivateRoute><FlowsList /></PrivateRoute>} />
          <Route path="/create-flow" element={<PrivateRoute><CreateFlow /></PrivateRoute>} />
          <Route path="/flow/:flowId" element={<PrivateRoute><FlowDetails /></PrivateRoute>} />
          <Route path="/activity" element={<PrivateRoute><Activity /></PrivateRoute>} />
          <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
