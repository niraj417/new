import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import AppShell from './components/layout/AppShell';
import Splash from './screens/auth/Splash';
import Onboarding from './screens/auth/Onboarding';
import Login from './screens/auth/Login';

import Home from './screens/dashboards/Home';
import Wallet from './screens/dashboards/Wallet';
import Profile from './screens/dashboards/Profile';

import FlowsList from './screens/flows/FlowsList';
import CreateFlow from './screens/flows/CreateFlow';
import FlowDetails from './screens/flows/FlowDetails';

import ScanPay from './screens/transactions/ScanPay';
import Activity from './screens/transactions/Activity';
import Insights from './screens/dashboards/Insights';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200EA', // Purple material color as brand base
    },
    secondary: {
      main: '#03DAC6',
    },
    background: {
      default: '#F5F5F5'
    }
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  shape: {
    borderRadius: 12
  }
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;

  return <AppShell>{children}</AppShell>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />

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
    </ThemeProvider>
  );
}

export default App;
