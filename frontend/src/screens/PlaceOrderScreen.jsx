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
  const [inventoryIssue, setInventoryIssue] = useState(null); 

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
  
  // Conditionally apply the Debit Fee
  const debitFee = paymentMethod === 'Debit Card' ? 3.00 : 0;
  const totalPrice = itemsPrice + exciseTax + localTax + stateTax + debitFee;

  const isPickup = shippingAddress.address === 'In-Store Pickup';
  let orderTypeDisplay = 'Delivery';
  if (isPickup) orderTypeDisplay = 'Pick-Up';
  else if (shippingAddress.terrainType === 'Water') orderTypeDisplay = 'Water Delivery';
  else if (shippingAddress.terrainType === 'Land') orderTypeDisplay = 'Land Delivery';

  const executeFinalOrder = async () => {
    try {
      setLoading(true);
      setError('');
      setInventoryIssue(null);

      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        totalAmount: totalPrice,
      });

      clearCart();
      navigate(`/order/${data._id}`); 
      
    } catch (err) {
      if (err.response?.data?.errorType === 'INVENTORY_SHORTAGE' || err.response?.status === 409) {
        setInventoryIssue(err.response.data);
        toast.warning('Cart update required to proceed.');
      } else {
        setError(err.response?.data?.message || 'Failed to place order.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fixCartHandler = () => {
    if (inventoryIssue.remainingQty === 0) {
      removeFromCart(inventoryIssue.product._id);
      toast.info(`${inventoryIssue.product.name} removed from cart.`);
      setInventoryIssue(null); 
    } else {
      removeFromCart(inventoryIssue.product._id);
      setTimeout(() => {
        addToCart(inventoryIssue.product, inventoryIssue.remainingQty);
        toast.success(`Cart corrected to ${inventoryIssue.remainingQty} available units.`);
        setInventoryIssue(null); 
      }, 50);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <CheckoutSteps step1 step2 step3 step4 step5 />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '30px' }}>
        
        {/* LEFT COLUMN: Review Info */}
        <div>
          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '15px' }}>Order Details</h2>
            
            <p style={{ margin: '5px 0' }}>
              <strong>Name: </strong> {userInfo?.firstName} {userInfo?.lastName}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Order Type: </strong> {orderTypeDisplay}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Address: </strong> 
              {isPickup 
                ? 'Northern Legacy Store' 
                : `${shippingAddress.address}, ${shippingAddress.city} ${shippingAddress.postalCode}`
              }
            </p>
            
            {/* THE FIX: Dynamically display the chosen scheduling window! */}
            {!isPickup && shippingAddress.deliveryDate && (
              <p style={{ margin: '5px 0', color: '#1890ff', fontWeight: 'bold' }}>
                <strong>Delivery Window: </strong> {shippingAddress.deliveryTimeSlot} on {shippingAddress.deliveryDate}
              </p>
            )}
          </div>

          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Payment Method</h2>
            <p><strong>Method: </strong> {paymentMethod}</p>
          </div>

          <div>
            <h2 style={{ marginBottom: '15px' }}>Order Items</h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {cartItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#1890ff', fontWeight: 'bold' }}>
                      {item.name}
                    </Link>
                    <span>
                      {item.qty} x ${(item.price / 100).toFixed(2)} = <strong>${((item.qty * item.price) / 100).toFixed(2)}</strong>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div style={{ border: '1px solid #ccc', padding: '25px', borderRadius: '8px', height: 'fit-content', background: '#f9f9f9', position: 'sticky', top: '20px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Order Summary</h2>
          
          {error && !inventoryIssue && <div style={{ background: '#ff4d4f', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

          {inventoryIssue && (
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: '15px', borderRadius: '8px', marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ color: '#d48806', margin: '0 0 10px 0', fontSize: '1.1rem' }}>⚠️ Cart Adjustment Needed</h3>
              <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>{inventoryIssue.message}</p>
              
              <button 
                onClick={fixCartHandler}
                style={{ width: '100%', padding: '10px', background: '#d48806', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {inventoryIssue.remainingQty === 0 
                  ? `Remove ${inventoryIssue.product.name} from Cart` 
                  : `Update Cart to ${inventoryIssue.remainingQty} Units`}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items:</span>
              <span>${addDecimals(itemsPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>NYS Excise Tax ({(TAX_RATES.EXCISE * 100).toFixed(0)}%):</span>
              <span>${addDecimals(exciseTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Local Retail Tax ({(TAX_RATES.LOCAL * 100).toFixed(0)}%):</span>
              <span>${addDecimals(localTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>State Sales Tax ({(TAX_RATES.STATE * 100).toFixed(0)}%):</span>
              <span>${addDecimals(stateTax)}</span>
            </div>

            {/* THE FIX: Conditionally render the Debit Convenience Fee! */}
            {debitFee > 0 && (
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                <span>Debit Processing Fee:</span>
                <span>${addDecimals(debitFee)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Total:</span>
              <span>${addDecimals(totalPrice)}</span>
            </div>

            {/* THE FIX: Button simplified now that payment logic was cleanly moved to the PaymentScreen */}
            <button 
              onClick={executeFinalOrder}
              disabled={cartItems.length === 0 || loading || inventoryIssue}
              style={{ 
                width: '100%', padding: '15px', marginTop: '10px', 
                background: (cartItems.length === 0 || loading || inventoryIssue) ? '#ccc' : 'black', 
                color: 'white', border: 'none', borderRadius: '5px', 
                cursor: (cartItems.length === 0 || loading || inventoryIssue) ? 'not-allowed' : 'pointer', 
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