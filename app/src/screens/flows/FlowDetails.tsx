import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Avatar, List, ListItem, ListItemText, ListItemAvatar } from '@mui/material';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

const FlowDetails: React.FC = () => {
    const { flowId } = useParams();
    const [tab, setTab] = useState(0);
    const [flow, setFlow] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!flowId) return;
            const fDoc = await getDoc(doc(db, 'flows', flowId));
            if (fDoc.exists()) {
                setFlow(fDoc.data());
            }

            const q = query(collection(db, 'transactions'), where('flowId', '==', flowId));
            const snaps = await getDocs(q);
            const res: any[] = [];
            snaps.forEach(d => res.push({ id: d.id, ...d.data() }));
            setTransactions(res);
        };
        fetchDetails();
    }, [flowId]);

    if (!flow) return <Typography sx={{ p: 4 }}>Loading...</Typography>;

    return (
        <Box sx={{ pt: 6 }}>
            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #6200EA 0%, #03DAC6 100%)', color: 'white' }}>
                <Typography variant="h4" fontWeight="bold">{flow.name}</Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.8, mb: 2 }}>{flow.budgetType} Budget: ${flow.budgetAmount}</Typography>
                <Typography variant="h3" fontWeight="bold">${flow.flowBalance}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Remaining Balance</Typography>
            </Box>

            <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                <Tab label="Transactions" />
                <Tab label="Members" />
                <Tab label="Rules" />
                <Tab label="Budget" />
            </Tabs>

            <TabPanel value={tab} index={0}>
                <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 3 }}>
                    {transactions.length === 0 ? <Typography>No transactions yet</Typography> : transactions.map(t => (
                        <ListItem key={t.id} sx={{ borderBottom: '1px solid #eee' }}>
                            <ListItemText primary={t.merchantName} secondary={t.category} />
                            <Typography fontWeight="bold" color={t.status === 'approved' ? 'error.main' : 'text.secondary'}>
                                {t.status === 'approved' ? '-' : ''}${t.amount}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            </TabPanel>

            <TabPanel value={tab} index={1}>
                <List>
                    {flow.participants?.map((p: any, i: number) => (
                        <ListItem key={i}>
                            <ListItemAvatar><Avatar>{p.email?.charAt(0)}</Avatar></ListItemAvatar>
                            <ListItemText primary={p.email} secondary={p.role} />
                        </ListItem>
                    ))}
                </List>
            </TabPanel>

            <TabPanel value={tab} index={2}>
                <Card sx={{ mb: 2 }}><CardContent><Typography variant="h6">Allowed Categories</Typography><Typography>{flow.rules?.allowedCategories?.join(', ') || 'Any'}</Typography></CardContent></Card>
                <Card sx={{ mb: 2 }}><CardContent><Typography variant="h6">Limits</Typography><Typography>Per Tx: ${flow.limits?.perTransaction || 'None'}</Typography></CardContent></Card>
                <Card sx={{ mb: 2 }}><CardContent><Typography variant="h6">Automations</Typography><Typography>Auto Refill: {flow.automations?.autoRefill ? 'Yes' : 'No'}</Typography></CardContent></Card>
            </TabPanel>

            <TabPanel value={tab} index={3}>
                <Typography>Budget usage visualization going here</Typography>
            </TabPanel>

        </Box>
    );
};

export default FlowDetails;
