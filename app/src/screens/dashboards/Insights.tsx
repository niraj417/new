import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const categoryData = [
    { name: 'Food', value: 400 },
    { name: 'Transport', value: 300 },
    { name: 'Materials', value: 1200 },
    { name: 'Fuel', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const budgetData = [
    { name: 'Site A', spent: 4000, remaining: 6000 },
    { name: 'Trip', spent: 1200, remaining: 300 },
    { name: 'Lunch', spent: 200, remaining: 150 },
];

const Insights: React.FC = () => {
    return (
        <Box sx={{ p: 2, pt: 6, pb: 10 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Insights</Typography>

            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Spending by Category</Typography>
                    <Box sx={{ height: 250, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {categoryData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Flow Budget Usage</Typography>
                    <Box sx={{ height: 250, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={50} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="spent" stackId="a" fill="#FF8042" />
                                <Bar dataKey="remaining" stackId="a" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Insights;
