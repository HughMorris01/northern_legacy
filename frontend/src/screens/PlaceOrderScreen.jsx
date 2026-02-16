import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CheckoutSteps from '../components/CheckoutSteps';
import { TAX_RATES } from '../utils/constants'; // <-- Import the new constants

const PlaceOrderScreen = () => {
  const navigate = useNavigate();

  const cartItems = useCartStore((state) => state.cartItems);
  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const paymentMethod = useCartStore((state) => state.paymentMethod);

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    } else if (!paymentMethod) {
      navigate('/payment');
    }
  }, [shippingAddress, paymentMethod, navigate]);

  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

  const itemsPrice = cartItems.reduce((acc, item) => acc + (item.price / 100) * item.qty, 0);
  
  // Apply the dynamic rates from constants.js
  const exciseTax = itemsPrice * TAX_RATES.EXCISE; 
  const localTax = itemsPrice * TAX_RATES.LOCAL;  
  const stateTax = itemsPrice * TAX_RATES.STATE;  
  
  const totalPrice = itemsPrice + exciseTax + localTax + stateTax;

  const placeOrderHandler = () => {
    // We will wire this up to the backend next!
    console.log('Order Placed!');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <CheckoutSteps step1 step2 step3 step4 />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '30px' }}>
        
        {/* LEFT COLUMN: Order Details */}
        <div>
          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Shipping / Delivery</h2>
            <p><strong>Terrain Type: </strong> {shippingAddress.terrainType}</p>
            <p>
              <strong>Address: </strong> 
              {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode}, {shippingAddress.state}
            </p>
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
                    <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: 'blue', fontWeight: 'bold' }}>
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

        {/* RIGHT COLUMN: The Tax & Summary Engine */}
        <div style={{ border: '1px solid #ccc', padding: '25px', borderRadius: '8px', height: 'fit-content', background: '#f9f9f9' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items:</span>
              <span>${addDecimals(itemsPrice)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>NYS Excise Tax (9%):</span>
              <span>${addDecimals(exciseTax)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Local Retail Tax (4%):</span>
              <span>${addDecimals(localTax)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>State Sales Tax (4%):</span>
              <span>${addDecimals(stateTax)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Total:</span>
              <span>${addDecimals(totalPrice)}</span>
            </div>

            <button 
              onClick={placeOrderHandler}
              disabled={cartItems.length === 0}
              style={{ 
                width: '100%', padding: '15px', marginTop: '10px', 
                background: cartItems.length === 0 ? '#ccc' : 'black', 
                color: 'white', border: 'none', borderRadius: '5px', 
                cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer', 
                fontSize: '1.1rem', fontWeight: 'bold' 
              }}
            >
              Place Order
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlaceOrderScreen;