import React from 'react';
import { Box, Typography, Avatar, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Button, Divider } from '@mui/material';
import { Security, Notifications, LinkRounded, HelpOutline, Description, Logout } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { userProfile, currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <Box sx={{ p: 2, pt: 6 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Profile
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, bgcolor: 'white', p: 2, borderRadius: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <Avatar src={userProfile?.profileImage} sx={{ width: 64, height: 64, mr: 2 }} />
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        {userProfile?.name || 'Anonymous User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {userProfile?.phone || userProfile?.email || currentUser?.uid}
                    </Typography>
                </Box>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, ml: 1 }}>Settings</Typography>
            <List sx={{ bgcolor: 'white', borderRadius: 3, mb: 3 }}>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon><Security /></ListItemIcon>
                        <ListItemText primary="Security & Privacy" />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon><Notifications /></ListItemIcon>
                        <ListItemText primary="Notifications" />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon><LinkRounded /></ListItemIcon>
                        <ListItemText primary="Connected Accounts" />
                    </ListItemButton>
                </ListItem>
            </List>

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, ml: 1 }}>Support</Typography>
            <List sx={{ bgcolor: 'white', borderRadius: 3, mb: 4 }}>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon><HelpOutline /></ListItemIcon>
                        <ListItemText primary="Help Center & Contact" />
                    </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon><Description /></ListItemIcon>
                        <ListItemText primary="Policies & Terms" />
                    </ListItemButton>
                </ListItem>
            </List>

            <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ borderRadius: 8, py: 1.5 }}
            >
                Log Out
            </Button>
        </Box>
    );
};

export default Profile;
