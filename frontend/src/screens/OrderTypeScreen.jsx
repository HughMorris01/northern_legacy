import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import useCartStore from '../store/cartStore'; 

const OrderTypeScreen = () => {
  const [orderType, setOrderType] = useState('Delivery'); 
  const navigate = useNavigate();

  const saveShippingAddress = useCartStore((state) => state.saveShippingAddress);
  // Bring in the current state to check for stale cache
  const shippingAddress = useCartStore((state) => state.shippingAddress);

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (orderType === 'Pickup') {
      saveShippingAddress({ address: 'In-Store Pickup', city: 'Clayton', postalCode: '13624', country: 'USA' });
      navigate('/payment'); 
    } else {
      // THE FIX: If they switch to Delivery, clear the 'In-Store Pickup' cache!
      if (shippingAddress?.address === 'In-Store Pickup') {
        saveShippingAddress({ address: '', city: 'Clayton', postalCode: '', country: 'USA' });
      }
      navigate('/shipping');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <CheckoutSteps step1 step2 />
      <h1 style={{ textAlign: 'center' }}>How would you like your order?</h1>
      <form onSubmit={submitHandler} style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ 
            padding: '20px', border: '2px solid', borderRadius: '8px', cursor: 'pointer',
            borderColor: orderType === 'Delivery' ? 'green' : '#ddd',
            background: orderType === 'Delivery' ? '#f6ffed' : 'white'
          }}>
            <input 
              type="radio" name="orderType" value="Delivery" 
              checked={orderType === 'Delivery'} 
              onChange={(e) => setOrderType(e.target.value)} 
            />
            <span style={{ marginLeft: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>🚚 Local Delivery</span>
            <p style={{ margin: '5px 0 0 25px', fontSize: '0.9rem', color: '#666' }}>Delivered directly to your door in Clayton.</p>
          </label>

          <label style={{ 
            padding: '20px', border: '2px solid', borderRadius: '8px', cursor: 'pointer',
            borderColor: orderType === 'Pickup' ? 'green' : '#ddd',
            background: orderType === 'Pickup' ? '#f6ffed' : 'white'
          }}>
            <input 
              type="radio" name="orderType" value="Pickup" 
              checked={orderType === 'Pickup'} 
              onChange={(e) => setOrderType(e.target.value)} 
            />
            <span style={{ marginLeft: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>🏪 In-Store Pickup</span>
            <p style={{ margin: '5px 0 0 25px', fontSize: '0.9rem', color: '#666' }}>Ready for pickup at Northern Legacy.</p>
          </label>
        </div>

        <button type="submit" style={{ 
          width: '100%', padding: '15px', marginTop: '30px', background: 'black', 
          color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '1.1rem' 
        }}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default OrderTypeScreen;