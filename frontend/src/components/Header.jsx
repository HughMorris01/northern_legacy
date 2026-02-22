import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import axios from '../axios';
import { toast } from 'react-toastify';
import '../styles/Header.css'; 

const Header = () => {
  const navigate = useNavigate();
  
  const cartItems = useCartStore((state) => state.cartItems);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const userInfo = useAuthStore((state) => state.userInfo);
  
  const showMergeModal = useCartStore((state) => state.showMergeModal);
  const resolveMerge = useCartStore((state) => state.resolveMerge);

  const greetingName = userInfo?.preferredFirstName || userInfo?.firstName;

  const handleMergeDecision = async (acceptMerge) => {
    resolveMerge(acceptMerge);
    
    try {
      const updatedCart = useCartStore.getState().cartItems;
      await axios.put('/api/users/cart', { cartItems: updatedCart });
    } catch (err) {
      console.error('Failed to sync resolved cart to database', err);
    }
    
    if (acceptMerge) {
      toast.info('Carts merged. Please review your cart to ensure you remain under legal limits.', { autoClose: 4000 });
      navigate('/cart');
    } else {
      toast.success('Previous cart discarded. Proceeding to checkout.');
      navigate('/order-type');
    }
  };

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
            <p className="logo-slogan">The <span className="slogan-1000">1000</span> <span className="slogan-islands">Islands'</span>Cannabis Dispensary</p>
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

      {/* --- GLOBAL MERGE CONFLICT MODAL --- */}
      {showMergeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s' }}>
            <h2 style={{ marginTop: 0, color: '#111', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📦 Cart Items Detected</h2>
            
            <p style={{ fontSize: '1.05rem', lineHeight: '1.5', color: '#444' }}>
              You have items saved in your account from a previous session. 
            </p>
            
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#666', marginBottom: '25px' }}>
              Would you like to merge these items into your current cart, or drop the previous items and proceed directly to checkout?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => handleMergeDecision(true)}
                style={{ padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#333'}
                onMouseOut={(e) => e.currentTarget.style.background = 'black'}
              >
                Merge With Previous Items
              </button>
              <button 
                onClick={() => handleMergeDecision(false)}
                style={{ padding: '12px', background: '#fff2f0', color: '#cf1322', border: '1px solid #ffa39e', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#ffccc7'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fff2f0'}
              >
                Drop Previous Items & Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;