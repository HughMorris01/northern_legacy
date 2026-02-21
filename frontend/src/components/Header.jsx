import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import '../styles/Header.css'; 

const Header = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const userInfo = useAuthStore((state) => state.userInfo);

  const greetingName = userInfo?.preferredFirstName || userInfo?.firstName;

  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="header-logo-link">
          <div className="logo-section">
            <img 
              src="/northern_beta_logo.jpg" 
              alt="Northern Legacy" 
              className="header-logo-img" 
            />
            <p className="logo-slogan">The <span className="slogan-1000">1000</span>Islands' Cannabis Dispensary</p>
          </div>
        </Link>
        
        <nav className="header-nav">
          <Link to="/cart" className="header-nav-link">
            🛒 Cart
            {totalItems > 0 && (
              <span className="cart-badge">
                {totalItems}
              </span>
            )}
          </Link>

          {userInfo ? (
            <Link to="/profile" className="profile-link">
              👤 <strong>{greetingName}</strong>
            </Link>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;