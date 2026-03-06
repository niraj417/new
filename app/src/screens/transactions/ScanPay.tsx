import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Food', 'Transport', 'Healthcare', 'Groceries', 'Materials', 'Fuel', 'Entertainment'];

const ScanPay: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [selectedFlow, setSelectedFlow] = useState('');
    const [flows, setFlows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFlows = async () => {
            const q = query(collection(db, 'flows'));
            const snaps = await getDocs(q);
            const f: any[] = [];
            snaps.forEach(s => f.push({ id: s.id, ...s.data() }));
            setFlows(f);
        };
        fetchFlows();
    }, []);

    const handleScan = (result: any) => {
        if (result) {
            // Mocking merchant decoded from QR
            setScanResult('Local Merchant ' + result[0].rawValue.substring(0, 6));
        }
    };

    const handlePay = async () => {
        if (!amount || !selectedFlow || !scanResult) return;
        setLoading(true);
        try {
            const txRef = await addDoc(collection(db, 'transactions'), {
                flowId: selectedFlow,
                userId: currentUser?.uid,
                merchantName: scanResult,
                category,
                amount: Number(amount),
                timestamp: serverTimestamp(),
                status: 'pending' // Cloud functions will validate this
            });
            alert('Payment submitted for validation. Transaction ID: ' + txRef.id);
            navigate('/activity');
        } catch (e) {
            console.error("Error creating transaction", e);
            alert("Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2, pt: 6, display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
            <Typography variant="h5" fontWeight="bold">Scan & Pay</Typography>

            {!scanResult ? (
                <Box sx={{ overflow: "hidden", borderRadius: 4 }}>
                    <Scanner onScan={handleScan} />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6" color="primary">Paying: {scanResult}</Typography>

                    <FormControl fullWidth>
                        <InputLabel>Select Flow to Pay From</InputLabel>
                        <Select value={selectedFlow} onChange={(e) => setSelectedFlow(e.target.value)} label="Select Flow to Pay From">
                            {flows.map(f => (
                                <MenuItem key={f.id} value={f.id}>{f.name} (Bal: ${f.flowBalance})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
                            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Amount ($)"
                        type="number"
                        fullWidth
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handlePay}
                        disabled={loading || !selectedFlow || !amount}
                        sx={{ mt: 2, borderRadius: 8, py: 1.5 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Payment'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default ScanPay;
