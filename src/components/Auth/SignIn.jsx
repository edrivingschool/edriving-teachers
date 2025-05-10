import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `https://driving-backend-stmb.onrender.com/api/teachers/signin`,
        { email, password }
      );
      
localStorage.setItem('token', response.data.token);
localStorage.setItem('teacherId', response.data.teacher.id);

navigate('/dashboard'); // Add this line
setLoading(false);
      
      setLoading(false);
    } catch (err) {
        console.error(err);
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <p>
          <button 
            type="button" 
            className="link-btn" 
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignIn;