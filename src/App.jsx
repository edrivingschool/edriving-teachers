import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ForgotPassword from './components/Auth/ForgotPassword';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ResetPassword from './components/Auth/ResetPassword';
import SignIn from './components/Auth/SignIn';
import VerifyOTP from './components/Auth/VerifyOTP';
import Dashboard from './components/Dashboard/Dashboard';


function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
      
        </Routes>
      </div>
    </Router>
  );
}

export default App;