import React, { useState } from 'react';
import { Box, Typography, Button, MobileStepper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        title: "Programmable flows",
        description: "Create custom financial flows with rules you control."
    },
    {
        title: "Shared spending",
        description: "Invite participants and securely allocate funds for group expenses."
    },
    {
        title: "Transparent tracking",
        description: "Track every transaction with clarity and deep insights."
    }
];

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const maxSteps = slides.length;

    const handleNext = () => {
        if (activeStep === maxSteps - 1) {
            navigate('/login');
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 3, pt: 10 }}>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom align="center" sx={{ mt: 5 }}>
                    {slides[activeStep].title}
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 2 }}>
                    {slides[activeStep].description}
                </Typography>
            </Box>

            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <MobileStepper
                    variant="dots"
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    sx={{ background: 'transparent' }}
                    nextButton={<span />}
                    backButton={<span />}
                />
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleNext}
                    sx={{ borderRadius: 8, py: 1.5 }}
                >
                    {activeStep === maxSteps - 1 ? "Get Started" : "Next"}
                </Button>
            </Box>
        </Box>
    );
};

export default Onboarding;
