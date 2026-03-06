import React from 'react';
import { Box, Typography, Card, CardContent, IconButton, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { AccountBalanceWallet, AddCircle, AccountTree, QrCodeScanner } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();

    return (
        <Box sx={{ p: 2, pt: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Hello, {userProfile?.name?.split(' ')[0] || 'User'}
                </Typography>
                <Avatar src={userProfile?.profileImage} />
            </Box>

            {/* Main Wallet Card */}
            <Card sx={{
                background: 'linear-gradient(135deg, #6200EA 0%, #B388FF 100%)',
                color: 'white',
                borderRadius: 4,
                mb: 3
            }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Wallet Balance</Typography>
                    <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>
                        ${(userProfile?.walletBalance || 0).toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<AddCircle />}
                            sx={{ borderRadius: 8 }}
                            onClick={() => navigate('/wallet')}
                        >
                            Add Money
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Quick Actions</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton sx={{ backgroundColor: 'white', boxShadow: 1, p: 2, mb: 1 }} onClick={() => navigate('/create-flow')}>
                        <AccountTree color="primary" />
                    </IconButton>
                    <Typography variant="caption">Create Flow</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton sx={{ backgroundColor: 'white', boxShadow: 1, p: 2, mb: 1 }} onClick={() => navigate('/scan')}>
                        <QrCodeScanner color="primary" />
                    </IconButton>
                    <Typography variant="caption">Scan & Pay</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton sx={{ backgroundColor: 'white', boxShadow: 1, p: 2, mb: 1 }} onClick={() => navigate('/wallet')}>
                        <AccountBalanceWallet color="primary" />
                    </IconButton>
                    <Typography variant="caption">Wallet</Typography>
                </Box>
            </Box>

            {/* Active Flows Summary */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Active Flows</Typography>
                <Button size="small" onClick={() => navigate('/flows')}>View All</Button>
            </Box>

            {/* Placeholder for flows list */}
            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3, p: 0, overflow: 'hidden' }}>
                <ListItem sx={{ borderBottom: '1px solid #eee' }}>
                    <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#03DAC6' }}><AccountTree /></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Team Lunch Fund" secondary="Balance: $150.00" />
                </ListItem>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#FF4081' }}><AccountTree /></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Project Materials" secondary="Balance: $4,200.00" />
                </ListItem>
            </List>

        </Box>
    );
};

export default Home;
