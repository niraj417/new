import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, Avatar, AvatarGroup, LinearProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

interface Flow {
    id: string;
    name: string;
    budgetAmount: number;
    flowBalance: number;
    participants: any[];
}

const FlowsList: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [flows, setFlows] = useState<Flow[]>([]);

    useEffect(() => {
        const fetchFlows = async () => {
            // For now, load all flows since complex array-contains queries on objects need specific index
            // In a real app, you'd index participants or have an explicit activeFlows[] on user profile.
            try {
                const q = query(collection(db, 'flows'));
                const querySnapshot = await getDocs(q);
                const fetchedFlows: Flow[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedFlows.push({ id: doc.id, ...doc.data() } as unknown as Flow);
                });
                setFlows(fetchedFlows);
            } catch (error) {
                console.error("Error fetching flows", error);
            }
        };
        if (currentUser) fetchFlows();
    }, [currentUser]);

    return (
        <Box sx={{ p: 2, pt: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">My Flows</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/create-flow')}
                    sx={{ borderRadius: 8 }}
                >
                    New Flow
                </Button>
            </Box>

            {/* Placeholder Cards if db is empty - to match premium look requirement */}
            <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} onClick={() => navigate('/flow/123')}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Construction Site B</Typography>
                            <Chip size="small" label="Monthly" color="primary" sx={{ mt: 0.5 }} />
                        </Box>
                        <AvatarGroup max={4}>
                            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                            <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                            <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                        </AvatarGroup>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Budget Remaining</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'end', mb: 1 }}>
                        <Typography variant="h4" fontWeight="bold">$4,250</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>/ $10,000</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={42.5} sx={{ height: 8, borderRadius: 4, bgcolor: '#eee' }} />
                </CardContent>
            </Card>

            <Card sx={{ mb: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} onClick={() => navigate('/flow/456')}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Family Shared Expenses</Typography>
                            <Chip size="small" label="Weekly" color="secondary" sx={{ mt: 0.5 }} />
                        </Box>
                        <AvatarGroup max={4}>
                            <Avatar>M</Avatar>
                            <Avatar>D</Avatar>
                        </AvatarGroup>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Budget Remaining</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'end', mb: 1 }}>
                        <Typography variant="h4" fontWeight="bold">$180</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>/ $500</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={36} color="secondary" sx={{ height: 8, borderRadius: 4, bgcolor: '#eee' }} />
                </CardContent>
            </Card>

            {/* Dynamically loaded flows from Firebase */}
            {flows.map((flow) => (
                <Card key={flow.id} sx={{ mb: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold">{flow.name}</Typography>
                        <Typography variant="body2">Balance: ${flow.flowBalance}</Typography>
                    </CardContent>
                </Card>
            ))}

        </Box>
    );
};

export default FlowsList;
