import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';

const Header = () => {
  // Pull the cart items from Zustand so we can count them for the notification badge
  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header style={{ background: '#1a1a1a', padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      
      {/* Brand Logo / Name */}
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
        🌲 Northern Legacy
      </Link>
      
      {/* Navigation Links */}
      <nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
        
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', position: 'relative' }}>
          🛒 Cart
          {/* Only show the red notification badge if there are items in the cart */}
          {totalItems > 0 && (
            <span style={{ 
              position: 'absolute', top: '-8px', right: '-12px', background: 'red', color: 'white', 
              borderRadius: '50%', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold' 
            }}>
              {totalItems}
            </span>
          )}
        </Link>

        {/* We will wire this login link up to the backend authentication next */}
        <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem' }}>
          👤 Login
        </Link>
        
      </nav>
    </header>
  );
};

export default Header;