import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';

const CartScreen = () => {
  const navigate = useNavigate();
  
  // Pull our state and actions from Zustand
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  // Calculate the running totals dynamically
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const totalWeight = cartItems.reduce((acc, item) => acc + item.qty * item.weightInOunces, 0);

  const checkoutHandler = () => {
    // This will eventually route to a login or shipping page
    navigate('/login?redirect=shipping');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🛒 Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div style={{ marginTop: '20px' }}>
          <p>Your cart is currently empty.</p>
          <Link to="/" style={{ color: 'blue', textDecoration: 'none', fontWeight: 'bold' }}>
            &larr; Go back to the menu
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' }}>
          
          {/* LEFT COLUMN: The Items */}
          <div>
            {cartItems.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px 0' }}>
                <div style={{ flex: 2 }}>
                  <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
                    {item.name}
                  </Link>
                </div>
                <div style={{ flex: 1 }}>${(totalPrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div style={{ flex: 1 }}>Qty: {item.qty}</div>
                {/* We show the weight line item to prove the math is working */}
                <div style={{ flex: 1, fontSize: '0.9em', color: 'gray' }}>{(item.weightInOunces * item.qty).toFixed(3)} oz</div>
                <div>
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    style={{ padding: '8px 12px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: The Checkout Summary */}
          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', height: 'fit-content', backgroundColor: '#f9f9f9' }}>
            <h2 style={{ marginTop: 0 }}>Order Summary</h2>
            <hr style={{ margin: '15px 0' }} />
            
            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Items:</strong></span> 
              <span>{totalItems}</span>
            </p>
            
            {/* The Legal Limit Tracker */}
            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Total Weight:</strong></span> 
              <span style={{ color: totalWeight > 2.5 ? 'orange' : 'green', fontWeight: 'bold' }}>
                {totalWeight.toFixed(3)} oz
              </span>
            </p>
            
            <h2 style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '15px', marginTop: '15px' }}>
              <span>Total:</span> 
              <span>${(totalPrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </h2>
            
            <button 
              onClick={checkoutHandler}
              style={{ width: '100%', padding: '15px', marginTop: '10px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold' }}
            >
              Proceed to Checkout
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartScreen;