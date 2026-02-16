import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const ShippingScreen = () => {
  const navigate = useNavigate();

  // Pull state and actions from our stores
  const userInfo = useAuthStore((state) => state.userInfo);
  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const saveShippingAddress = useCartStore((state) => state.saveShippingAddress);

  // Pre-fill the state with saved data if it exists
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [terrainType, setTerrainType] = useState(shippingAddress?.terrainType || 'Land');

  // Security Check: If they aren't logged in, boot them to the login screen
  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=shipping');
    }
  }, [userInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    
    // Save the data to Zustand and LocalStorage
    saveShippingAddress({ address, city, postalCode, country: 'US', state: 'NY', terrainType });
    
    // Move them to the next step in the checkout flow
    navigate('/payment');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Delivery Details</h1>
      
      <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Northern Legacy Specific: Terrain Type */}
        <div style={{ padding: '15px', border: '2px solid #333', borderRadius: '8px', background: '#f9f9f9' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Select Delivery Terrain
          </label>
          <select 
            value={terrainType} 
            onChange={(e) => setTerrainType(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem' }}
          >
            <option value="Land">Type A: Land (Standard Street Address)</option>
            <option value="Water">Type B: Water (Island / Dock Delivery)</option>
          </select>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px', marginBottom: 0 }}>
            *Water delivery is strictly limited to the active summer maritime season.
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Address / Plus Code</label>
          <input 
            type="text" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            required
            placeholder={terrainType === 'Water' ? "Enter Plus Code (e.g., 87G8MPG2+V3)" : "123 Main St"}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City</label>
            <input 
              type="text" value={city} onChange={(e) => setCity(e.target.value)} required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Zip Code</label>
            <input 
              type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Locked Compliance Fields */}
        <div style={{ display: 'flex', gap: '15px', opacity: 0.6 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>State</label>
            <input type="text" value="NY" disabled style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', background: '#eee' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Country</label>
            <input type="text" value="US" disabled style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', background: '#eee' }} />
          </div>
        </div>

        <button 
          type="submit" 
          style={{ padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '10px' }}
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

export default ShippingScreen;