import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import axios from '../axios'; // Need this to hit the backend logout route

const Header = () => {
  const navigate = useNavigate();

  // 1. Cart State
  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const clearCart = useCartStore((state) => state.clearCart);

  // 2. Auth State
  const userInfo = useAuthStore((state) => state.userInfo);
  const logout = useAuthStore((state) => state.logout);

  // 3. The Logout Function
  const logoutHandler = async () => {
    // Step A: Attempt the background sync, but DON'T let it block the logout
    try {
      await axios.put('/api/users/cart', { cartItems });
    } catch (syncError) {
      console.warn('Cart sync failed, but proceeding with logout anyway.', syncError);
    }

    // Step B: Execute the mandatory logout sequence
    try {
      await axios.post('/api/users/logout');
      logout();
      clearCart();
      navigate('/login');
    } catch (error) {
      console.error('Fatal error during logout sequence', error);
    }
  };

  return (
   
    <header style={{ background: '#1a1a1a', padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
      
      {/* Brand Logo */}
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <img width="100px" style={{borderRadius:'50%'}} src='/northern_beta_logo.jpg' alt="Northern Legacy" />
      </Link>
      
    
      <nav style={{ display: 'flex', gap: '25px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', position: 'relative' }}>
          🛒 Cart
          {totalItems > 0 && (
            <span style={{ 
              position: 'absolute', top: '-10px', right: '-10px', background: 'red', color: 'white', 
              borderRadius: '50%', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold' 
            }}>
              {totalItems}
            </span>
          )}
        </Link>

        {/* Dynamic Auth Links: The Bouncer Logic */}
        {userInfo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>
              Hello, <strong>{userInfo.firstName}</strong>
            </Link>
            <button 
              onClick={logoutHandler}
              style={{ background: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>
            👤 Login
          </Link>
        )}
        
      </nav>
    </header>
  );
};

export default Header;