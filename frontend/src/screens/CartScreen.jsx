import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore'; 

// HELPER: Converts decimal database weights to dispensary standard fractions
const getFractionalWeight = (decimalOz) => {
  if (!decimalOz || decimalOz === 0) return '';
  
  // Flower Weights
  if (Math.abs(decimalOz - 0.125) < 0.001) return '1/8 oz';
  if (Math.abs(decimalOz - 0.25) < 0.001) return '1/4 oz';
  if (Math.abs(decimalOz - 0.5) < 0.001) return '1/2 oz';
  if (Math.abs(decimalOz - 1.0) < 0.001) return '1 oz';
  
  // Concentrate/Vape/Pre-roll Weights (from PRD)
  if (Math.abs(decimalOz - 0.035) < 0.001) return '1g';
  if (Math.abs(decimalOz - 0.017) < 0.001) return '0.5g';
  if (Math.abs(decimalOz - 0.061) < 0.001) return '1.75g'; 
  
  // Fallback
  return `${decimalOz.toFixed(3)} oz`;
};

const CartScreen = () => {
  const navigate = useNavigate();
  
  const userInfo = useAuthStore((state) => state.userInfo);
  
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const addToCart = useCartStore((state) => state.addToCart);

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const totalWeight = cartItems.reduce((acc, item) => acc + item.qty * item.weightInOunces, 0);

  const checkoutHandler = () => {
    // SECURITY SWEEP
    cartItems.forEach((item) => {
      if (item.qty === 0) {
        removeFromCart(item._id);
      }
    });

    if (!userInfo) {
      navigate('/login?redirect=/order-type');
    } else if (!userInfo.isVerified) {
      navigate('/verify?redirect=/order-type');
    } else {
      navigate('/order-type');
    }
  };

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '20px' }}>🛒 Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div style={{ marginTop: '20px', padding: '40px 20px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>Your cart is currently empty.</p>
          <Link to="/" style={{ padding: '12px 25px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '20px' }}>
          
          {/* LEFT COLUMN: The Items */}
          <div>
            {cartItems.map((item) => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px 0', width: '100%' }}>
                
                {/* 1. Name & Fractional Weight */}
                <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', paddingRight: '10px', minWidth: '80px' }}>
                  <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#1890ff', fontWeight: 'bold', fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)', lineHeight: '1.2' }}>
                    {item.name}
                  </Link>
                  {item.weightInOunces > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', fontWeight: 'bold' }}>
                      {getFractionalWeight(item.weightInOunces)}
                    </span>
                  )}
                </div>
                
                {/* 2. THE FIX: Quantity Controls & Unit Price (Stacked Vertically) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 8px)' }}>
                    <button 
                      onClick={() => addToCart(item, -1)}
                      disabled={item.qty <= 0}
                      style={{ padding: '4px 10px', cursor: item.qty <= 0 ? 'not-allowed' : 'pointer', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    
                    <span style={{ fontWeight: 'bold', fontSize: '1rem', width: '15px', textAlign: 'center', color: item.qty === 0 ? '#999' : '#111' }}>
                      {item.qty}
                    </span>
                    
                    <button 
                      onClick={() => addToCart(item, 1)}
                      disabled={item.qty >= item.stockQuantity}
                      style={{ padding: '4px 10px', cursor: item.qty >= item.stockQuantity ? 'not-allowed' : 'pointer', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Unit price tucked right underneath */}
                  <span style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', color: '#666', fontWeight: 'bold' }}>
                    ${(item.price / 100).toFixed(2)} / ea
                  </span>
                </div>
                
                {/* 3. The Dynamic Spacer */}
                <div style={{ flexGrow: 1, minWidth: '10px' }}></div>
                
                {/* 4. Total Price & Remove Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 15px)', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 'bold', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', color: item.qty === 0 ? '#999' : '#111' }}>
                    Total: ${((item.price * item.qty) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    style={{ padding: '6px 10px', background: '#fff2f0', color: '#cf1322', border: '1px solid #ffa39e', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#ffccc7'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#fff2f0'}
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: The Checkout Summary */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <div style={{ border: '1px solid #ccc', padding: '25px', borderRadius: '8px', background: '#f9f9f9' }}>
              <h2 style={{ marginTop: 0, borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>Order Summary</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span><strong>Items:</strong></span> 
                <span>{totalItems}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span><strong>Total Weight:</strong></span> 
                <span style={{ color: totalWeight > 3.0 ? '#cf1322' : '#389e0d', fontWeight: 'bold' }}>
                  {totalWeight.toFixed(3)} oz
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '15px', marginTop: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total:</span> 
                <span>${(totalPrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <button 
                onClick={checkoutHandler}
                disabled={totalItems === 0 || totalWeight > 3.0} 
                style={{ 
                  width: '100%', padding: '15px', marginTop: '20px', 
                  background: (totalItems === 0 || totalWeight > 3.0) ? '#ccc' : 'black', 
                  color: 'white', border: 'none', borderRadius: '5px', 
                  cursor: (totalItems === 0 || totalWeight > 3.0) ? 'not-allowed' : 'pointer', 
                  fontSize: '1.1rem', fontWeight: 'bold', transition: 'background 0.3s' 
                }}
              >
                Proceed to Checkout
              </button>

              <Link 
                to="/" 
                style={{ 
                  display: 'block', width: '100%', textAlign: 'center', padding: '15px', marginTop: '10px',
                  background: 'white', color: '#333', border: '1px solid #ccc', borderRadius: '5px',
                  textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold', boxSizing: 'border-box'
                }}
              >
                Continue Shopping
              </Link>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartScreen;