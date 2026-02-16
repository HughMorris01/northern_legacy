import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from '../axios'; // Using our custom configured Axios
import useAuthStore from '../store/authStore';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Pulling our Zustand state and actions
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const userInfo = useAuthStore((state) => state.userInfo);

  // If they were redirected here from the cart, we want to send them back there after login
  const redirect = location.search ? location.search.split('=')[1] : '/';

  // If the user is already logged in, push them away from the login screen
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing on form submit
    setError(''); // Clear any previous errors

    try {
      // Hit our new backend endpoint
      const { data } = await axios.post('/api/users/login', { email, password });
      
      // Save the user data to Zustand and localStorage
      setCredentials(data);
      
      // Send them to the homepage (or back to their cart)
      navigate(redirect);
    } catch (err) {
      // If the backend sends back a 401 Unauthorized, display the error message
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Sign In</h1>
      
      {error && (
        <div style={{ background: '#ff4d4f', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button 
          type="submit" 
          style={{ padding: '12px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '10px' }}
        >
          Sign In
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        New Customer?{' '}
        <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} style={{ color: 'blue', textDecoration: 'none' }}>
          Register Here
        </Link>
      </div>
    </div>
  );
};

export default LoginScreen;