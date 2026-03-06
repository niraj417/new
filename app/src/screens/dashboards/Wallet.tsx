import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { AccountBalanceWallet, AddCircleOutline, ArrowDownward } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';

const Wallet: React.FC = () => {
    const { userProfile, currentUser } = useAuth();
    const [amount, setAmount] = useState('');

    const handleAddMoney = async () => {
        if (!currentUser || !amount || isNaN(Number(amount))) return;

        // Simulate UPI/Card payment success
        const numAmount = Number(amount);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                walletBalance: increment(numAmount)
            });
            setAmount('');
            alert("Successfully added money to wallet!");
        } catch (error) {
            console.error(error);
            alert("Failed to add money");
        }
    };

    return (
        <Box sx={{ p: 2, pt: 6 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Main Wallet
            </Typography>

            <Card sx={{
                background: 'linear-gradient(135deg, #03DAC6 0%, #018786 100%)',
                color: 'white',
                borderRadius: 4,
                mb: 4
            }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                    <AccountBalanceWallet sx={{ fontSize: 48, mb: 1, opacity: 0.8 }} />
                    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Current Balance</Typography>
                    <Typography variant="h2" fontWeight="bold">
                        ${(userProfile?.walletBalance || 0).toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Add Money</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                    label="Amount ($)"
                    type="number"
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddMoney}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    Add
                </Button>
            </Box>

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Recent Wallet Activity</Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3, p: 0 }}>
                {/* Placeholder for real transaction history */}
                <ListItem sx={{ borderBottom: '1px solid #eee' }}>
                    <ListItemIcon>
                        <AddCircleOutline color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Added via UPI" secondary="Today, 10:42 AM" />
                    <Typography variant="body1" fontWeight="bold" color="success.main">+$500.00</Typography>
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <ArrowDownward color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Transfer to Team Lunch Flow" secondary="Yesterday, 2:15 PM" />
                    <Typography variant="body1" fontWeight="bold" color="error.main">-$50.00</Typography>
                </ListItem>
            </List>
        </Box>
    );
};

export default Wallet;
