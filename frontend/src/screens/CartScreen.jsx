import { Link, useNavigate } from 'react-router-dom';
import axios from '../axios'; 
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore'; 
import { toast } from 'react-toastify';
import '../styles/CartScreen.css'; 

const FLOWER_CATEGORIES = ['Flower', 'Pre-Roll'];
const CONCENTRATE_CATEGORIES = ['Concentrate', 'Vape', 'Edible', 'Tincture'];

const getConcentrateGrams = (item) => {
  if (item.concentrateGrams) return item.concentrateGrams;
  if (item.weightInOunces > 0) return Number((item.weightInOunces * 28.3495).toFixed(2));
  if (item.category === 'Edible' || item.category === 'Tincture') return 1.0; 
  return 0;
};

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
    <div className="cart-screen-container">
      <h1 className="cart-screen-title">🛒 Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <p className="empty-cart-text">Your cart is currently empty.</p>
          <Link to="/" className="empty-cart-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          
          <div>
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item-row">
                
                <div className="cart-item-info">
                  <Link to={`/product/${item._id}`} className="cart-item-title">
                    {item.name}
                  </Link>
                  <span className="cart-item-subtitle">
                    {getFractionalDisplay(item)}
                  </span>
                </div>
                
                <div className="cart-item-qty-col">
                  <div className="qty-controls">
                    <button 
                      onClick={() => updateQtyHandler(item, -1)}
                      disabled={item.qty <= 0}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className={`qty-value ${item.qty === 0 ? 'zero' : ''}`}>
                      {item.qty}
                    </span>
                    <button 
                      onClick={() => updateQtyHandler(item, 1)}
                      disabled={item.qty >= item.stockQuantity}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-item-unit-price">
                    ${(item.price / 100).toFixed(2)} / ea
                  </span>
                </div>
                
                <div className="spacer"></div>
                
                <div className="cart-item-actions">
                  <span className={`cart-item-total ${item.qty === 0 ? 'zero' : ''}`}>
                    Total: ${((item.price * item.qty) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button 
                    onClick={() => removeItemHandler(item._id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>

          <div className="cart-summary-col">
            <div className="cart-summary-box">
              <h2 className="cart-summary-title">Order Summary</h2>
              
              <div className="summary-item-count">
                <span><strong>Total Items:</strong></span> 
                <span>{totalItems}</span>
              </div>
              
              <div className="limits-box">
                <h4 className="limits-title">Legal Purchase Limits</h4>
                
                <div className="limit-row">
                  <div className="limit-label-wrapper">
                    <span>Flower & Pre-Rolls</span>
                    <span className={`limit-value ${totalFlowerWeight > 3.0 ? 'exceeded' : ''}`}>
                      {totalFlowerWeight.toFixed(2)} / 3.0 oz
                    </span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className={`progress-fill ${totalFlowerWeight > 3.0 ? 'danger' : 'flower-safe'}`} 
                      style={{ width: `${Math.min((totalFlowerWeight / 3.0) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="limit-label-wrapper">
                    <span>Vapes & Edibles</span>
                    <span className={`limit-value ${totalConcentrateWeight > 24.0 ? 'exceeded' : ''}`}>
                      {totalConcentrateWeight.toFixed(1)} / 24.0 g
                    </span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className={`progress-fill ${totalConcentrateWeight > 24.0 ? 'danger' : 'concentrate-safe'}`}
                      style={{ width: `${Math.min((totalConcentrateWeight / 24.0) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="cart-total-row">
                <span>Total:</span> 
                <span>${(totalPrice / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <button 
                onClick={checkoutHandler}
                disabled={totalItems === 0 || isOverLimit} 
                className="checkout-btn"
              >
                Proceed to Checkout
              </button>

              <Link to="/" className="continue-shopping-link">
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