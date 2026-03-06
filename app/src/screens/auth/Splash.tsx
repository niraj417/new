import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Splash: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Logic to check if user has seen onboarding could go here
            // For now, go to onboarding directly
            navigate('/onboarding');
        }, 2500);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #6200EA 0%, #03DAC6 100%)',
                color: 'white'
            }}
        >
            <Typography variant="h2" fontWeight="bold" gutterBottom>
                FlowPay
            </Typography>
            <Typography variant="h6">
                Programmable Money Flows
            </Typography>
        </Box>
    );
};

export default Splash;
