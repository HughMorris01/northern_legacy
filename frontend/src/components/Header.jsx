import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const Header = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const userInfo = useAuthStore((state) => state.userInfo);

  // Dynamically prioritize the preferred name for the greeting
  const greetingName = userInfo?.preferredFirstName || userInfo?.firstName;

  return (
    <header style={{ background: '#1a1a1a', padding: '10px 15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
      
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="/northern_beta_logo.jpg" 
          alt="Northern Legacy" 
          style={{ 
            height: '70px', 
            WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)',
            maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)'
          }} 
        />
      </Link>
      
      <nav style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        <Link 
          to="/cart" 
          style={{ color: 'white', textDecoration: 'none', fontSize: '1rem', position: 'relative', marginRight: '5px', transition: 'color 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.color = '#1890ff'}
          onMouseOut={(e) => e.currentTarget.style.color = 'white'}
        >
          🛒 Cart
          {totalItems > 0 && (
            <span style={{ 
              position: 'absolute', top: '-8px', right: '-12px', background: '#cf1322', color: 'white', 
              borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {totalItems}
            </span>
          )}
        </Link>

        {userInfo ? (
          <Link 
            to="/profile" 
            style={{ color: 'white', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s', marginLeft: '10px' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#1890ff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            👤 <strong>{greetingName}</strong>
          </Link>
        ) : (
          <Link 
            to="/login" 
            style={{ background: 'white', color: 'black', textDecoration: 'none', padding: '6px 15px', borderRadius: '5px', fontSize: '0.95rem', fontWeight: 'bold', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e6e6e6'}
            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
          >
            Login
          </Link>
        )}
        
      </nav>
    </header>
  );
};

export default Header;