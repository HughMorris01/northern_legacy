import { Link, useNavigate } from 'react-router-dom';
import axios from '../axios'; 
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore'; 
import { toast } from 'react-toastify';

const FLOWER_CATEGORIES = ['Flower', 'Pre-Roll'];
const CONCENTRATE_CATEGORIES = ['Concentrate', 'Vape', 'Edible', 'Tincture'];

const getConcentrateGrams = (item) => {
  if (item.concentrateGrams) return item.concentrateGrams;
  if (item.weightInOunces > 0) return Number((item.weightInOunces * 28.3495).toFixed(2));
  if (item.category === 'Edible' || item.category === 'Tincture') return 1.0; 
  return 0;
};

// HELPER: Converts decimal database weights to dispensary standard fractions
const getFractionalDisplay = (item) => {
  if (CONCENTRATE_CATEGORIES.includes(item.category)) {
    const grams = getConcentrateGrams(item);
    if (Math.abs(grams - 1.0) < 0.05) return '1g eq.';
    if (Math.abs(grams - 0.5) < 0.05) return '0.5g eq.';
    if (Math.abs(grams - 1.75) < 0.05) return '1.75g eq.';
    return `${grams}g eq.`;
  }

  const decimalOz = item.weightInOunces;
  if (!decimalOz || decimalOz === 0) return '';
  if (Math.abs(decimalOz - 0.125) < 0.001) return '1/8 oz';
  if (Math.abs(decimalOz - 0.25) < 0.001) return '1/4 oz';
  if (Math.abs(decimalOz - 0.5) < 0.001) return '1/2 oz';
  if (Math.abs(decimalOz - 1.0) < 0.001) return '1 oz';
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
  
  const totalFlowerWeight = cartItems.reduce((acc, item) => 
    FLOWER_CATEGORIES.includes(item.category) ? acc + (item.weightInOunces * item.qty) : acc, 0
  );

  const totalConcentrateWeight = cartItems.reduce((acc, item) => 
    CONCENTRATE_CATEGORIES.includes(item.category) ? acc + (getConcentrateGrams(item) * item.qty) : acc, 0
  );

  const isOverLimit = totalFlowerWeight > 3.0 || totalConcentrateWeight > 24.0;

  const syncCartToDb = async () => {
    if (userInfo) {
      try {
        const updatedCart = useCartStore.getState().cartItems;
        await axios.put('/api/users/cart', { cartItems: updatedCart });
      } catch (err) {
        console.error('Failed to sync cart to database', err);
      }
    }
  };

  const updateQtyHandler = async (item, qtyDelta) => {
    const newQty = item.qty + qtyDelta;
    const isSuccess = addToCart(item, qtyDelta);
    
    if (isSuccess) {
      await syncCartToDb();
      
      // Trigger an info toast if they just added the last available unit
      if (qtyDelta > 0 && newQty >= item.stockQuantity) {
        toast.info(`Inventory maximum reached. You have claimed all available units of ${item.name}!`, {
          icon: '📦',
          autoClose: 3000
        });
      }
    }
  };

  const removeItemHandler = async (id) => {
    removeFromCart(id);
    await syncCartToDb();
  };

  const checkoutHandler = () => {
    cartItems.forEach((item) => {
      if (item.qty === 0) {
        removeItemHandler(item._id); 
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
          
          <div>
            {cartItems.map((item) => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px 0', width: '100%' }}>
                
                <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', paddingRight: '10px', minWidth: '80px' }}>
                  <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#1890ff', fontWeight: 'bold', fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)', lineHeight: '1.2' }}>
                    {item.name}
                  </Link>
                  <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', fontWeight: 'bold' }}>
                    {getFractionalDisplay(item)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 8px)' }}>
                    <button 
                      onClick={() => updateQtyHandler(item, -1)}
                      disabled={item.qty <= 0}
                      style={{ padding: '4px 10px', cursor: item.qty <= 0 ? 'not-allowed' : 'pointer', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 'bold', fontSize: '1rem', width: '15px', textAlign: 'center', color: item.qty === 0 ? '#999' : '#111' }}>
                      {item.qty}
                    </span>
                    <button 
                      onClick={() => updateQtyHandler(item, 1)}
                      disabled={item.qty >= item.stockQuantity}
                      style={{ padding: '4px 10px', cursor: item.qty >= item.stockQuantity ? 'not-allowed' : 'pointer', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', color: '#666', fontWeight: 'bold' }}>
                    ${(item.price / 100).toFixed(2)} / ea
                  </span>
                </div>
                
                <div style={{ flexGrow: 1, minWidth: '10px' }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 15px)', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 'bold', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', color: item.qty === 0 ? '#999' : '#111' }}>
                    Total: ${((item.price * item.qty) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button 
                    onClick={() => removeItemHandler(item._id)}
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

          <div style={{ position: 'sticky', top: '20px' }}>
            <div style={{ border: '1px solid #ccc', padding: '25px', borderRadius: '8px', background: '#f9f9f9' }}>
              <h2 style={{ marginTop: 0, borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>Order Summary</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                <span><strong>Total Items:</strong></span> 
                <span>{totalItems}</span>
              </div>
              
              <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '0.95rem', color: '#111' }}>Legal Purchase Limits</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Flower & Pre-Rolls</span>
                    <span style={{ color: totalFlowerWeight > 3.0 ? '#cf1322' : '#666', fontWeight: 'bold' }}>
                      {totalFlowerWeight.toFixed(2)} / 3.0 oz
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#eaeaea', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: totalFlowerWeight > 3.0 ? '#cf1322' : '#52c41a', 
                      width: `${Math.min((totalFlowerWeight / 3.0) * 100, 100)}%`,
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span>Vapes & Edibles</span>
                    <span style={{ color: totalConcentrateWeight > 24.0 ? '#cf1322' : '#666', fontWeight: 'bold' }}>
                      {totalConcentrateWeight.toFixed(1)} / 24.0 g
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#eaeaea', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: totalConcentrateWeight > 24.0 ? '#cf1322' : '#1890ff', 
                      width: `${Math.min((totalConcentrateWeight / 24.0) * 100, 100)}%`,
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '15px', marginTop: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total:</span> 
                <span>${(totalPrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <button 
                onClick={checkoutHandler}
                disabled={totalItems === 0 || isOverLimit} 
                style={{ 
                  width: '100%', padding: '15px', marginTop: '20px', 
                  background: (totalItems === 0 || isOverLimit) ? '#ccc' : 'black', 
                  color: 'white', border: 'none', borderRadius: '5px', 
                  cursor: (totalItems === 0 || isOverLimit) ? 'not-allowed' : 'pointer', 
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