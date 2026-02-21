import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';
import useCartStore from '../store/cartStore';
import { TAX_RATES } from '../utils/constants';

const OrderTypeScreen = () => {
  const navigate = useNavigate();

  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const saveShippingAddress = useCartStore((state) => state.saveShippingAddress);
  const cartItems = useCartStore((state) => state.cartItems);

  const MIN_DELIVERY_AMOUNT = 100;
  const itemsPrice = cartItems.reduce((acc, item) => acc + (item.price / 100) * item.qty, 0);
  const isBelowMinimum = itemsPrice < MIN_DELIVERY_AMOUNT;
  const amountNeeded = MIN_DELIVERY_AMOUNT - itemsPrice;

  const [orderType, setOrderType] = useState(
    shippingAddress?.address === 'In-Store Pickup' ? 'Pickup' : 'Delivery'
  );

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    
    // Prevent selecting Delivery if below minimum
    if (selectedType === 'Delivery' && isBelowMinimum) {
      return;
    }
    
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
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #eee' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>Choose Order Type</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>How would you like to receive your order?</p>
      </div>
      <form onSubmit={submitHandler}>
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {isBelowMinimum && (
            <div style={{ background: '#fff7e6', border: '1px solid #ffbb96', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
              <h3 style={{ color: '#d46b08', margin: '0 0 8px 0', fontSize: '1rem' }}>🚚 Delivery Minimum Required</h3>
              <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>Delivery orders require a minimum of ${MIN_DELIVERY_AMOUNT.toFixed(2)}.</p>
              <p style={{ margin: 0, color: '#d46b08', fontWeight: 'bold', fontSize: '0.95rem' }}>Add ${amountNeeded.toFixed(2)} more to your cart to unlock delivery.</p>
            </div>
          )}
          
          <label style={{ 
            display: 'block', padding: '20px', border: '2px solid', borderRadius: '8px', cursor: isBelowMinimum ? 'not-allowed' : 'pointer',
            borderColor: orderType === 'Delivery' ? 'green' : '#ddd',
            background: isBelowMinimum ? '#f5f5f5' : (orderType === 'Delivery' ? '#f6ffed' : 'white'),
            opacity: isBelowMinimum ? 0.6 : 1,
            pointerEvents: isBelowMinimum ? 'none' : 'auto'
          }}>
            <input 
              type="radio" 
              name="orderType" 
              value="Delivery" 
              checked={orderType === 'Delivery'} 
              onChange={handleTypeChange}
              disabled={isBelowMinimum}
            />
            <span style={{ marginLeft: '10px', fontSize: '1.2rem', fontWeight: 'bold', color: isBelowMinimum ? '#999' : 'black' }}>🚚 Local Delivery</span>
            <p style={{ margin: '5px 0 0 25px', fontSize: '0.9rem', color: isBelowMinimum ? '#999' : '#666' }}>Delivered directly to your door in Clayton.</p>
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