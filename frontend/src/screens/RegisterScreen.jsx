import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from '../axios'; 
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore'; 
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/profile';

  const setCredentials = useAuthStore((state) => state.setCredentials);
  const userInfo = useAuthStore((state) => state.userInfo);
  
  const mergeCarts = useCartStore((state) => state.mergeCarts);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (userInfo) {
      // If they are already logged in, respect the redirect flow
      if (!userInfo.isVerified && redirect !== '/profile') {
        navigate(`/verify?redirect=${redirect}`);
      } else {
        navigate(redirect);
      }
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post('/api/users/register', { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      setCredentials(data);
      
      try {
        const { data: dbCart } = await axios.get('/api/users/cart');
        mergeCarts(dbCart);
      } catch (cartErr) {
        console.error('Failed to sync cart on register', cartErr);
      }

      toast.success('Account created successfully!');
      
      // THE FIX: Hijack the route if they aren't verified and are trying to checkout
      if (!data.isVerified && redirect !== '/profile') {
        navigate(`/verify?redirect=${redirect}`);
      } else {
        navigate(redirect);
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Error registering user');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/users/google', {
        credential: credentialResponse.credential,
      });
      setCredentials(data);
      
      try {
        const { data: dbCart } = await axios.get('/api/users/cart');
        mergeCarts(dbCart);
      } catch (cartErr) {
        console.error('Failed to sync cart on google register', cartErr);
      }

      toast.success('Account linked with Google!');
      
      // THE FIX: Hijack the route if they aren't verified and are trying to checkout
      if (!data.isVerified && redirect !== '/profile') {
        navigate(`/verify?redirect=${redirect}`);
      } else {
        navigate(redirect);
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Google authentication failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto', padding: '0 15px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        <h1 style={{ textAlign: 'center', margin: '0 0 10px 0', fontSize: '2rem' }}>Create an Account</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Join Northern Legacy for seamless ordering and delivery.</p>

        {clientId ? (
          <GoogleOAuthProvider clientId={clientId}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google popup closed or failed to initialize.')}
                theme="outline"
                size="large"
                width="100%"
                text="signup_with"
                shape="rectangular"
              />
            </div>
          </GoogleOAuthProvider>
        ) : (
          <div style={{ padding: '10px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ margin: 0, color: '#d48806', fontSize: '0.85rem' }}>⚠️ Google Client ID is missing from .env</p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #eee' }} />
          <span style={{ padding: '0 15px', color: '#999', fontSize: '0.85rem', fontWeight: 'bold' }}>OR REGISTER WITH EMAIL</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #eee' }} />
        </div>

        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>First Name</label>
              <input 
                type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem' }}
              />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Last Name</label>
              <input 
                type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Email Address</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Password</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Confirm Password</label>
            <input 
              type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '10px', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#333'}
            onMouseOut={(e) => e.currentTarget.style.background = 'black'}
          >
            {loading ? <Loader /> : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: '#555' }}>
          Already have an account?{' '}
          <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 'bold' }}>
            Sign In
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default RegisterScreen;