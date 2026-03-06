import { Navigate } from 'react-router-dom';
// Login is now consolidated into Onboarding (Email OTP flow)
const Login = () => <Navigate to="/onboarding" replace />;
export default Login;
