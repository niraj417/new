import React, { useState } from 'react';
import { Box, Typography, Button, Stepper, Step, StepLabel, TextField, MenuItem, Select, FormControl, InputLabel, Chip, OutlinedInput, FormControlLabel, Switch } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const steps = ['Basics', 'Budget', 'Participants', 'Categories', 'Limits', 'Rules', 'Automation', 'Fund & Activate'];

const CATEGORIES = ['Food', 'Transport', 'Healthcare', 'Groceries', 'Materials', 'Fuel', 'Entertainment'];

const CreateFlowWizard: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();

    const [activeStep, setActiveStep] = useState(0);
    const [flowData, setFlowData] = useState({
        name: '',
        description: '',
        budgetType: 'Monthly',
        budgetAmount: '',
        participants: [] as { email: string, role: string }[],
        allowedCategories: [] as string[],
        perTransactionLimit: '',
        dailyLimit: '',
        monthlyLimit: '',
        merchantRestrictions: '',
        locationRestrictions: '',
        approvalRequired: false,
        receiptRequired: false,
        autoRefill: false,
        initialFunding: ''
    });

    const [partEmail, setPartEmail] = useState('');
    const [partRole, setPartRole] = useState('Spender');

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            handleComplete();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleChange = (prop: string) => (event: any) => {
        setFlowData({ ...flowData, [prop]: event.target.value });
    };

    const handleAddParticipant = () => {
        if (partEmail) {
            setFlowData(prev => ({
                ...prev,
                participants: [...prev.participants, { email: partEmail, role: partRole }]
            }));
            setPartEmail('');
        }
    };

    const handleComplete = async () => {
        try {
            const flowPayload = {
                name: flowData.name,
                description: flowData.description,
                ownerId: currentUser?.uid,
                createdAt: serverTimestamp(),
                budgetType: flowData.budgetType,
                budgetAmount: Number(flowData.budgetAmount),
                flowBalance: Number(flowData.initialFunding),
                status: 'active',
                participants: [{ userId: currentUser?.uid, email: currentUser?.email, role: 'Owner' }, ...flowData.participants],
                rules: {
                    allowedCategories: flowData.allowedCategories,
                    allowedMerchants: flowData.merchantRestrictions.split(',').map(s => s.trim()).filter(Boolean),
                    geoRestriction: flowData.locationRestrictions,
                    receiptRequired: flowData.receiptRequired,
                    approvalRequired: flowData.approvalRequired
                },
                limits: {
                    perTransaction: Number(flowData.perTransactionLimit) || null,
                    dailyLimit: Number(flowData.dailyLimit) || null,
                    monthlyLimit: Number(flowData.monthlyLimit) || null
                },
                automations: {
                    autoRefill: flowData.autoRefill
                }
            };

            await addDoc(collection(db, 'flows'), flowPayload);
            alert('Flow Created Successfully!');
            navigate('/flows');
        } catch (error) {
            console.error('Error creating flow', error);
            alert('Failed to create flow');
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                        <TextField label="Flow Name" fullWidth value={flowData.name} onChange={handleChange('name')} placeholder="e.g. Construction Site A" />
                        <TextField label="Description" fullWidth multiline rows={3} value={flowData.description} onChange={handleChange('description')} />
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Budget Type</InputLabel>
                            <Select value={flowData.budgetType} label="Budget Type" onChange={handleChange('budgetType')}>
                                <MenuItem value="Daily">Daily</MenuItem>
                                <MenuItem value="Weekly">Weekly</MenuItem>
                                <MenuItem value="Monthly">Monthly</MenuItem>
                                <MenuItem value="Custom">Custom</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField label="Budget Amount ($)" type="number" fullWidth value={flowData.budgetAmount} onChange={handleChange('budgetAmount')} />
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField label="Participant Email" fullWidth size="small" value={partEmail} onChange={e => setPartEmail(e.target.value)} />
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Role</InputLabel>
                                <Select value={partRole} label="Role" onChange={e => setPartRole(e.target.value)}>
                                    <MenuItem value="Manager">Manager</MenuItem>
                                    <MenuItem value="Spender">Spender</MenuItem>
                                    <MenuItem value="Viewer">Viewer</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" onClick={handleAddParticipant}>Add</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                            {flowData.participants.map((p, i) => (
                                <Chip key={i} label={`${p.email} (${p.role})`} onDelete={() => {
                                    setFlowData(prev => ({ ...prev, participants: prev.participants.filter((_, idx) => idx !== i) }))
                                }} />
                            ))}
                        </Box>
                    </Box>
                );
            case 3:
                return (
                    <Box sx={{ mt: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Allowed Categories</InputLabel>
                            <Select
                                multiple
                                value={flowData.allowedCategories}
                                onChange={handleChange('allowedCategories')}
                                input={<OutlinedInput label="Allowed Categories" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as string[]).map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {CATEGORIES.map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                );
            case 4:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                        <TextField label="Per Transaction Limit ($)" type="number" fullWidth value={flowData.perTransactionLimit} onChange={handleChange('perTransactionLimit')} />
                        <TextField label="Daily Limit ($)" type="number" fullWidth value={flowData.dailyLimit} onChange={handleChange('dailyLimit')} />
                        <TextField label="Monthly Limit ($)" type="number" fullWidth value={flowData.monthlyLimit} onChange={handleChange('monthlyLimit')} />
                    </Box>
                );
            case 5:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                        <TextField label="Allowed Merchants (comma separated)" fullWidth value={flowData.merchantRestrictions} onChange={handleChange('merchantRestrictions')} />
                        <TextField label="Location Restrictions (e.g. Zip code)" fullWidth value={flowData.locationRestrictions} onChange={handleChange('locationRestrictions')} />
                        <FormControlLabel control={<Switch checked={flowData.approvalRequired} onChange={(e) => setFlowData({ ...flowData, approvalRequired: e.target.checked })} />} label="Transactions require strict approval" />
                        <FormControlLabel control={<Switch checked={flowData.receiptRequired} onChange={(e) => setFlowData({ ...flowData, receiptRequired: e.target.checked })} />} label="Require receipt upload post-transaction" />
                    </Box>
                );
            case 6:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                        <FormControlLabel control={<Switch checked={flowData.autoRefill} onChange={(e) => setFlowData({ ...flowData, autoRefill: e.target.checked })} />} label="Auto-refill flow from main wallet when balance is low" />
                        <Typography variant="body2" color="text.secondary">Alerts for 80% usage are automatically enabled for all flows.</Typography>
                    </Box>
                );
            case 7:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                        <Typography variant="h6">Funding source: Main Wallet (${userProfile?.walletBalance || 0})</Typography>
                        <TextField label="Allocate Initial Funds ($)" type="number" fullWidth value={flowData.initialFunding} onChange={handleChange('initialFunding')} />
                    </Box>
                );
            default:
                return "Unknown step";
        }
    };

    return (
        <Box sx={{ p: 2, pt: 6, pb: 10 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Create New Flow</Typography>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, overflowX: 'auto' }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box sx={{ minHeight: '40vh' }}>
                {renderStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined" sx={{ borderRadius: 8 }}>
                    Back
                </Button>
                <Button variant="contained" onClick={handleNext} sx={{ borderRadius: 8 }}>
                    {activeStep === steps.length - 1 ? 'Launch Flow' : 'Next'}
                </Button>
            </Box>
        </Box>
    );
};

export default CreateFlowWizard;
