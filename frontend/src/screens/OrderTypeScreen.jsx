import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import useCartStore from '../store/cartStore';

const OrderTypeScreen = () => {
  const navigate = useNavigate();

  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const saveShippingAddress = useCartStore((state) => state.saveShippingAddress);

  const [orderType, setOrderType] = useState(
    shippingAddress?.address === 'In-Store Pickup' ? 'Pickup' : 'Delivery'
  );

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setOrderType(selectedType);

    if (selectedType === 'Pickup') {
      saveShippingAddress({ address: 'In-Store Pickup', city: 'Clayton', postalCode: '13624', country: 'USA', terrainType: 'Land' });
    } else {
      if (shippingAddress?.address === 'In-Store Pickup') {
        saveShippingAddress({ address: '', city: '', postalCode: '', country: 'USA', terrainType: 'Land' });
      }
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (orderType === 'Pickup') {
      navigate('/payment'); 
    } else {
      navigate('/shipping');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <CheckoutSteps step1 step2 />
      <h1>Order Type</h1>
      <form onSubmit={submitHandler}>
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <label style={{ 
            display: 'block', padding: '20px', border: '2px solid', borderRadius: '8px', cursor: 'pointer',
            borderColor: orderType === 'Delivery' ? 'green' : '#ddd',
            background: orderType === 'Delivery' ? '#f6ffed' : 'white'
          }}>
            <input 
              type="radio" 
              name="orderType" 
              value="Delivery" 
              checked={orderType === 'Delivery'} 
              onChange={handleTypeChange} 
            />
            <span style={{ marginLeft: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>🚚 Local Delivery</span>
            <p style={{ margin: '5px 0 0 25px', fontSize: '0.9rem', color: '#666' }}>Delivered directly to your door in Clayton.</p>
          </label>

          <label style={{ 
            display: 'block', padding: '20px', border: '2px solid', borderRadius: '8px', cursor: 'pointer',
            borderColor: orderType === 'Pickup' ? 'green' : '#ddd',
            background: orderType === 'Pickup' ? '#f6ffed' : 'white'
          }}>
            <input 
              type="radio" 
              name="orderType" 
              value="Pickup" 
              checked={orderType === 'Pickup'} 
              onChange={handleTypeChange} 
            />
            <span style={{ marginLeft: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>🏪 In-Store Pickup</span>
            <p style={{ margin: '5px 0 0 25px', fontSize: '0.9rem', color: '#666' }}>Ready for pickup at Northern Legacy.</p>
          </label>

        </div>
        <button type="submit" style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default OrderTypeScreen;