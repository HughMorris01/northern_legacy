import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore'; 
import CheckoutSteps from '../components/CheckoutSteps';
import { TAX_RATES } from '../utils/constants'; 
import axios from '../axios'; 
import { toast } from 'react-toastify';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();

  const userInfo = useAuthStore((state) => state.userInfo); 
  const cartItems = useCartStore((state) => state.cartItems);
  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const paymentMethod = useCartStore((state) => state.paymentMethod);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State handlers for specific checkout roadblocks
  const [inventoryIssue, setInventoryIssue] = useState(null); 
  const [limitIssue, setLimitIssue] = useState(null); 
  const [deliveryIssue, setDeliveryIssue] = useState(null); // THE FIX: New Route Issue State

  useEffect(() => {
    if (cartItems.length === 0) return;

    if (!shippingAddress.address) {
      navigate('/shipping');
    } else if (!paymentMethod) {
      navigate('/payment');
    }
  }, [shippingAddress, paymentMethod, navigate, cartItems.length]);

  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

  const itemsPrice = cartItems.reduce((acc, item) => acc + (item.price / 100) * item.qty, 0);
  const exciseTax = itemsPrice * TAX_RATES.EXCISE; 
  const localTax = itemsPrice * TAX_RATES.LOCAL;  
  const stateTax = itemsPrice * TAX_RATES.STATE;  
  
  const debitFee = paymentMethod === 'Debit Card' ? 3.00 : 0;
  const totalPrice = itemsPrice + exciseTax + localTax + stateTax + debitFee;

  const isPickup = shippingAddress.address === 'In-Store Pickup';
  let orderTypeDisplay = 'Delivery';
  if (isPickup) orderTypeDisplay = 'Pick-Up';
  else if (shippingAddress.terrainType === 'Water') orderTypeDisplay = 'Water Delivery';
  else if (shippingAddress.terrainType === 'Land') orderTypeDisplay = 'Land Delivery';

  let formattedDeliveryDate = shippingAddress.deliveryDate;
  if (shippingAddress.deliveryDate) {
    const [year, month, day] = shippingAddress.deliveryDate.split('-');
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    formattedDeliveryDate = `${dayOfWeek}, ${shippingAddress.deliveryDate}`;
  }

  const executeFinalOrder = async () => {
    try {
      setLoading(true);
      setError('');
      setInventoryIssue(null);
      setLimitIssue(null);
      setDeliveryIssue(null);

      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        totalAmount: totalPrice,
      });

      clearCart();
      navigate(`/order/${data._id}`); 
      
    } catch (err) {
      const errorType = err.response?.data?.errorType;
      
      if (errorType === 'INVENTORY_SHORTAGE' || err.response?.status === 409 && !errorType) {
        setInventoryIssue(err.response.data);
        toast.warning('Cart update required to proceed.');
      } else if (errorType === 'DAILY_LIMIT_EXCEEDED') {
        setLimitIssue(err.response.data.message);
        toast.error('Legal limits exceeded for today.');
      } else if (errorType === 'DELIVERY_UNAVAILABLE') {
        // THE FIX: Catch the Anchor Race Condition and trigger the UI
        setDeliveryIssue(err.response.data.message);
        toast.error('Delivery route update required.');
      } else {
        setError(err.response?.data?.message || 'Failed to place order.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fixCartHandler = (shouldRedirect = false, redirectPath = '/cart') => {
    if (inventoryIssue.remainingQty === 0) {
      removeFromCart(inventoryIssue.product._id);
      toast.info(`${inventoryIssue.product.name} removed from cart.`);
      setInventoryIssue(null); 
      if (shouldRedirect) navigate(redirectPath);
    } else {
      removeFromCart(inventoryIssue.product._id);
      setTimeout(() => {
        addToCart(inventoryIssue.product, inventoryIssue.remainingQty);
        toast.success(`Cart corrected to ${inventoryIssue.remainingQty} available units.`);
        setInventoryIssue(null); 
        if (shouldRedirect) navigate(redirectPath);
      }, 50);
    }
  };

  // Prevent checkout button from clicking if ANY issue is active
  const isCheckoutDisabled = cartItems.length === 0 || loading || inventoryIssue || limitIssue || deliveryIssue;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto 40px', padding: '0 15px', fontFamily: 'sans-serif' }}>
      <CheckoutSteps step1 step2 step3 step4 step5 />

      <style>{`
        .place-order-grid { display: flex; flex-direction: column; gap: 20px; margin-top: 20px; }
        .order-summary-col { order: -1; border: 1px solid #eaeaea; padding: 20px; border-radius: 12px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .order-details-col { order: 1; }
        @media (min-width: 768px) {
          .place-order-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; align-items: start; }
          .order-summary-col { order: 2; position: sticky; top: 20px; }
        }
      `}</style>

      <div className="place-order-grid">
        
        <div className="order-details-col">
          <div style={{ paddingBottom: '15px', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>Order Details</h2>
            
            <p style={{ margin: '5px 0', fontSize: '0.95rem' }}>
              <strong>Name: </strong> {userInfo?.firstName} {userInfo?.lastName}
            </p>
            <p style={{ margin: '5px 0', fontSize: '0.95rem' }}>
              <strong>Order Type: </strong> {orderTypeDisplay}
            </p>
            <p style={{ margin: '5px 0', fontSize: '0.95rem', lineHeight: '1.4' }}>
              <strong>Address: </strong> 
              {isPickup 
                ? 'Northern Legacy Store' 
                : `${shippingAddress.address}, ${shippingAddress.city} ${shippingAddress.postalCode}`
              }
            </p>
            
            {!isPickup && shippingAddress.deliveryDate && (
              <p style={{ margin: '8px 0 0 0', color: '#1890ff', fontWeight: 'bold', fontSize: '0.95rem' }}>
                Delivery Window: {shippingAddress.deliveryTimeSlot} on {formattedDeliveryDate}
              </p>
            )}
          </div>

          <div style={{ paddingBottom: '15px', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>Payment Method</h2>
            <p style={{ margin: 0, fontSize: '0.95rem' }}><strong>Method: </strong> {paymentMethod}</p>
          </div>

          <div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>Order Items</h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cartItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
                    <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#1890ff', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      {item.name}
                    </Link>
                    <span style={{ fontSize: '0.95rem' }}>
                      {item.qty} x ${(item.price / 100).toFixed(2)} = <strong>${((item.qty * item.price) / 100).toFixed(2)}</strong>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="order-summary-col">
          <h2 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '2px solid #ddd', paddingBottom: '10px', fontSize: '1.4rem' }}>Order Summary</h2>
          
          {error && !inventoryIssue && !limitIssue && !deliveryIssue && <div style={{ background: '#ff4d4f', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem', fontWeight: 'bold' }}>{error}</div>}

          {/* THE FIX: Render the Delivery Route Race Condition Error Block */}
          {deliveryIssue && (
            <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', padding: '15px', borderRadius: '8px', marginBottom: '15px', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ color: '#cf1322', margin: '0 0 8px 0', fontSize: '1.05rem' }}>🚐 Route Update Required</h3>
              <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.85rem', lineHeight: '1.4' }}>{deliveryIssue}</p>
              <button 
                onClick={() => navigate('/shipping')}
                style={{ width: '100%', padding: '10px', background: '#cf1322', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Return to Shipping to Reschedule
              </button>
            </div>
          )}

          {limitIssue && (
             <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', padding: '15px', borderRadius: '8px', marginBottom: '15px', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ color: '#cf1322', margin: '0 0 8px 0', fontSize: '1.05rem' }}>🛑 Legal Limit Exceeded</h3>
              <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.85rem', lineHeight: '1.4' }}>{limitIssue}</p>
              <Link to="/cart" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '10px', background: '#cf1322', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '0.95rem', boxSizing: 'border-box' }}>
                Return to Cart to Edit
              </Link>
            </div>
          )}

          {inventoryIssue && !limitIssue && !deliveryIssue && (
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: '15px', borderRadius: '8px', marginBottom: '15px', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ color: '#d48806', margin: '0 0 8px 0', fontSize: '1.05rem' }}>⚠️ Cart Adjustment Needed</h3>
              <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.85rem', lineHeight: '1.4' }}>{inventoryIssue.message}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cartItems.length === 1 && inventoryIssue.remainingQty === 0 ? (
                  <button 
                    onClick={() => fixCartHandler(true, '/')}
                    style={{ width: '100%', padding: '10px', background: '#d48806', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
                  >
                    Remove Item & Return to Shop
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => fixCartHandler(false)}
                      style={{ width: '100%', padding: '10px', background: '#d48806', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
                    >
                      {inventoryIssue.remainingQty === 0 
                        ? `Remove Item & Continue Checkout` 
                        : `Update to ${inventoryIssue.remainingQty} Units & Continue Checkout`}
                    </button>

                    <button 
                      onClick={() => fixCartHandler(true, '/cart')}
                      style={{ width: '100%', padding: '10px', background: '#fff', color: '#d48806', border: '1px solid #d48806', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
                    >
                      {inventoryIssue.remainingQty === 0 
                        ? `Remove Item & Review Cart` 
                        : `Update Units & Review Cart`}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items:</span>
              <span>${addDecimals(itemsPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>NYS Excise Tax ({(TAX_RATES.EXCISE * 100).toFixed(0)}%):</span>
              <span>${addDecimals(exciseTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Local Tax ({(TAX_RATES.LOCAL * 100).toFixed(0)}%):</span>
              <span>${addDecimals(localTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>State Tax ({(TAX_RATES.STATE * 100).toFixed(0)}%):</span>
              <span>${addDecimals(stateTax)}</span>
            </div>

            {debitFee > 0 && (
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                <span>Debit Processing Fee:</span>
                <span>${addDecimals(debitFee)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '12px', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '5px' }}>
              <span>Total:</span>
              <span>${addDecimals(totalPrice)}</span>
            </div>

            <button 
              onClick={executeFinalOrder}
              disabled={isCheckoutDisabled}
              style={{ 
                width: '100%', padding: '15px', marginTop: '10px', 
                background: isCheckoutDisabled ? '#ccc' : 'black', 
                color: 'white', border: 'none', borderRadius: '5px', 
                cursor: isCheckoutDisabled ? 'not-allowed' : 'pointer', 
                fontSize: '1.1rem', fontWeight: 'bold', transition: 'background 0.3s'
              }}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlaceOrderScreen;