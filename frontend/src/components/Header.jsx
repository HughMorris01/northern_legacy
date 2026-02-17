import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import axios from '../axios'; 

const Header = () => {
  const navigate = useNavigate();

  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const clearCart = useCartStore((state) => state.clearCart);

  const userInfo = useAuthStore((state) => state.userInfo);
  const logout = useAuthStore((state) => state.logout);

  const logoutHandler = async () => {
    try {
      await axios.put('/api/users/cart', { cartItems });
    } catch (syncError) {
      console.warn('Cart sync failed, but proceeding with logout anyway.', syncError);
    }

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
    // Reduced padding for mobile, wrapped in a flexbox
    <header style={{ background: '#1a1a1a', padding: '10px 15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
      
      {/* Brand Logo: Scaled down from 100px to 60px for mobile */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} src='/northern_beta_logo.jpg' alt="Northern Legacy" />
      </Link>
      
      <nav style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Cart Link with Badge */}
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none', fontSize: '1rem', position: 'relative', marginRight: '5px' }}>
          🛒 Cart
          {totalItems > 0 && (
            <span style={{ 
              position: 'absolute', top: '-8px', right: '-12px', background: 'red', color: 'white', 
              borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' 
            }}>
              {totalItems}
            </span>
          )}
        </Link>

        {userInfo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Shorter greeting for mobile */}
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>
              👤 <strong>{userInfo.firstName}</strong>
            </Link>
            <button 
              onClick={logoutHandler}
              style={{ background: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Logout
            </button>
          </div>
        ) : (
          /* NEW: A highly visible Login button */
          <Link to="/login" style={{ 
            background: 'white', color: 'black', textDecoration: 'none', 
            padding: '6px 12px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold' 
          }}>
            Login
          </Link>
        )}
        
      </nav>
    </header>
  );
};

export default Header;