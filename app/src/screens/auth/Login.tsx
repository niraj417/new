import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PhoneIcon from '@mui/icons-material/Phone';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible'
            });
        }
    };

    const handlePhoneLogin = async () => {
        try {
            setupRecaptcha();
            const formatPhone = '+' + phone; // assuming international format without + input
            const confirmation = await signInWithPhoneNumber(auth, formatPhone, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setShowOtp(true);
        } catch (error) {
            console.error(error);
            alert('Error sending OTP. Please try again.');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            await confirmationResult.confirm(otp);
            navigate('/home');
        } catch (error) {
            alert('Invalid OTP');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/home');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 3, pt: 10 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome to FlowPay
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
                Sign in to manage your programmable money flows.
            </Typography>

            {!showOtp ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}
                        sx={{ py: 1.5, borderRadius: 2 }}
                    >
                        Continue with Google
                    </Button>

                    <Divider>OR</Divider>

                    <TextField
                        fullWidth
                        label="Phone Number (e.g., 1234567890)"
                        variant="outlined"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<PhoneIcon />}
                        onClick={handlePhoneLogin}
                        disabled={phone.length < 10}
                        sx={{ py: 1.5, borderRadius: 2 }}
                    >
                        Login with Phone
                    </Button>
                    <div id="recaptcha-container"></div>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        fullWidth
                        label="Enter OTP"
                        variant="outlined"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        onClick={handleVerifyOtp}
                        disabled={otp.length < 6}
                        sx={{ py: 1.5, borderRadius: 2 }}
                    >
                        Verify & Secure Login
                    </Button>
                </Box>
            )}
        </Box>
    );
};

declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}

export default Login;
