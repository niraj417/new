import React from 'react';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LayersIcon from '@mui/icons-material/Layers';
import HistoryIcon from '@mui/icons-material/History';
import InsightsIcon from '@mui/icons-material/Insights';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box sx={{ pb: 7, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {children}
            </Box>
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={location.pathname}
                    onChange={(_event, newValue) => {
                        navigate(newValue);
                    }}
                >
                    <BottomNavigationAction label="Home" value="/home" icon={<HomeIcon />} />
                    <BottomNavigationAction label="Flows" value="/flows" icon={<LayersIcon />} />
                    <BottomNavigationAction label="Activity" value="/activity" icon={<HistoryIcon />} />
                    <BottomNavigationAction label="Insights" value="/insights" icon={<InsightsIcon />} />
                    <BottomNavigationAction label="Profile" value="/profile" icon={<PersonIcon />} />
                </BottomNavigation>
            </Paper>
        </Box>
    );
};

export default AppShell;
