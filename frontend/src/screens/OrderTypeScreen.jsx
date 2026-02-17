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
      // FIX: Added 'terrainType' to satisfy MongoDB's strict schema rules
      saveShippingAddress({ 
        address: 'In-Store Pickup', city: 'Alexandria Bay', postalCode: '13607', country: 'USA', terrainType: 'Land' 
      });
      navigate('/payment'); 
    } else {
      if (shippingAddress?.address === 'In-Store Pickup') {
        // FIX: Added 'terrainType' here as well in case they switch back to delivery
        saveShippingAddress({ 
          address: '', city: '', postalCode: '', country: 'USA', terrainType: '' 
        });
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