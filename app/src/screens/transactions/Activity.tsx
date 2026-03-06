import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const Activity: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchTxs = async () => {
            const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(50));
            const snaps = await getDocs(q);
            const res: any[] = [];
            snaps.forEach(d => res.push({ id: d.id, ...d.data() }));
            setTransactions(res);
        };
        fetchTxs();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'warning';
        }
    };

    return (
        <Box sx={{ p: 2, pt: 6, pb: 10 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Global Activity</Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3 }}>
                {transactions.map(t => (
                    <ListItem key={t.id} sx={{ borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                            <ListItemText primary={t.merchantName} secondary={
                                <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                    <Typography variant="caption">{new Date(t.timestamp?.toDate()).toLocaleDateString()}</Typography>
                                    <Chip label={t.status} color={getStatusColor(t.status) as any} size="small" sx={{ height: 20, fontSize: 10 }} />
                                </Box>
                            } />
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography fontWeight="bold" color={t.status === 'rejected' ? 'text.secondary' : 'error.main'}>
                                ${t.amount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{t.category}</Typography>
                        </Box>
                    </ListItem>
                ))}
                {transactions.length === 0 && <Typography sx={{ p: 2 }}>No activity found.</Typography>}
            </List>
        </Box>
    );
};

export default Activity;
