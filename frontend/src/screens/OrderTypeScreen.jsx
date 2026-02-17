import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import useCartStore from '../store/cartStore';

const OrderTypeScreen = () => {
  const navigate = useNavigate();

  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const saveShippingAddress = useCartStore((state) => state.saveShippingAddress);

  // 1. Initialize the radio button based on what is currently in memory (Handles the Back Button)
  const [orderType, setOrderType] = useState(
    shippingAddress?.address === 'In-Store Pickup' ? 'Pickup' : 'Delivery'
  );

  // 2. Instantly update global memory the second a radio button is clicked
  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setOrderType(selectedType);

    if (selectedType === 'Pickup') {
      // Instantly crosses out the SHIP step
      saveShippingAddress({ address: 'In-Store Pickup', city: 'Clayton', postalCode: '13624', country: 'USA', terrainType: 'Land' });
    } else {
      // Instantly un-crosses the SHIP step if they change their mind
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
      <h1>Order Method</h1>
      <form onSubmit={submitHandler}>
        <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.2rem', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="orderType" 
              value="Delivery" 
              checked={orderType === 'Delivery'} 
              onChange={handleTypeChange} 
            />
            <span style={{ marginLeft: '10px' }}>🚚 Local Delivery</span>
          </label>

          <label style={{ display: 'block', fontSize: '1.2rem', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="orderType" 
              value="Pickup" 
              checked={orderType === 'Pickup'} 
              onChange={handleTypeChange} 
            />
            <span style={{ marginLeft: '10px' }}>🏪 In-Store Pickup (Clayton, NY)</span>
          </label>

        </div>
        <button type="submit" style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          Continue
        </button>
      </form>
    </div>
  );
};

export default OrderTypeScreen;