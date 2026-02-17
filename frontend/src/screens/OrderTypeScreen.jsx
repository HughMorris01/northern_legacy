import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import useCartStore from '../store/cartStore';

const OrderTypeScreen = () => {
  const navigate = useNavigate();

  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const saveShippingAddress = useCartStore((state) => state.saveShippingAddress);

<<<<<<< HEAD
=======
  // 1. Initialize the radio button based on what is currently in memory (Handles the Back Button)
>>>>>>> 52994f48c70353deede6b4ff1405fb7ffd19ac57
  const [orderType, setOrderType] = useState(
    shippingAddress?.address === 'In-Store Pickup' ? 'Pickup' : 'Delivery'
  );

<<<<<<< HEAD
=======
  // 2. Instantly update global memory the second a radio button is clicked
>>>>>>> 52994f48c70353deede6b4ff1405fb7ffd19ac57
  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setOrderType(selectedType);

    if (selectedType === 'Pickup') {
<<<<<<< HEAD
      saveShippingAddress({ address: 'In-Store Pickup', city: 'Clayton', postalCode: '13624', country: 'USA', terrainType: 'Land' });
    } else {
=======
      // Instantly crosses out the SHIP step
      saveShippingAddress({ address: 'In-Store Pickup', city: 'Clayton', postalCode: '13624', country: 'USA', terrainType: 'Land' });
    } else {
      // Instantly un-crosses the SHIP step if they change their mind
>>>>>>> 52994f48c70353deede6b4ff1405fb7ffd19ac57
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
<<<<<<< HEAD
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <label style={{ 
            display: 'block', padding: '20px', border: '2px solid', borderRadius: '8px', cursor: 'pointer',
            borderColor: orderType === 'Delivery' ? 'green' : '#ddd',
            background: orderType === 'Delivery' ? '#f6ffed' : 'white'
          }}>
=======
        <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.2rem', cursor: 'pointer' }}>
>>>>>>> 52994f48c70353deede6b4ff1405fb7ffd19ac57
            <input 
              type="radio" 
              name="orderType" 
              value="Delivery" 
              checked={orderType === 'Delivery'} 
              onChange={handleTypeChange} 
            />
            <span style={{ marginLeft: '10px' }}>🚚 Local Delivery</span>
          </label>

<<<<<<< HEAD
          <label style={{ 
            display: 'block', padding: '20px', border: '2px solid', borderRadius: '8px', cursor: 'pointer',
            borderColor: orderType === 'Pickup' ? 'green' : '#ddd',
            background: orderType === 'Pickup' ? '#f6ffed' : 'white'
          }}>
=======
          <label style={{ display: 'block', fontSize: '1.2rem', cursor: 'pointer' }}>
>>>>>>> 52994f48c70353deede6b4ff1405fb7ffd19ac57
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
<<<<<<< HEAD
        <button type="submit" style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
=======
        <button type="submit" style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
>>>>>>> 52994f48c70353deede6b4ff1405fb7ffd19ac57
          Continue
        </button>
      </form>
    </div>
  );
};

export default OrderTypeScreen;