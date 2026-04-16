import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // In production, this would redirect to iDAS for authentication
    // For now, we just simulate a successful login and redirect to home
    const idasUrl = 'https://idas.example.com/login?redirect=' + encodeURIComponent(window.location.origin + '/');

    // Check if we have a callback from iDAS
    const urlParams = new URLSearchParams(window.location.search);
    const isCallback = urlParams.get('token');

    if (isCallback) {
      // Handle iDAS callback - in production, validate token here
      navigate('/');
    } else {
      // Redirect to iDAS login
      // For demo purposes, we'll just go to home since there's no real iDAS
      navigate('/');
    }
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>正在跳转至 iDAS 登录...</p>
      </div>
    </div>
  );
}

export default Login;
