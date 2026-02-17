import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CheckoutSteps from '../components/CheckoutSteps';
import axios from '../axios';

const ShippingScreen = () => {
  const navigate = useNavigate();
  
  // Pull existing shipping address from the cart store if they've already been here
  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const saveShippingAddress = useCartStore((state) => state.saveShippingAddress);

  // Form State
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [terrainType, setTerrainType] = useState(shippingAddress?.terrainType || 'Land');

  // Profile Address State
  const [savedProfileAddress, setSavedProfileAddress] = useState(null);

  // 1. Check the database for a default profile address on load
  useEffect(() => {
    const fetchProfileAddress = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        if (data.address && data.address.street) {
          setSavedProfileAddress(data.address);
        }
      } catch {
        console.warn('No profile address found or user not logged in.');
      }
    };
    fetchProfileAddress();
  }, []);

  // 2. The Autofill Trigger
  const handleAutofill = () => {
    if (savedProfileAddress) {
      setAddress(savedProfileAddress.street);
      setCity(savedProfileAddress.city);
      setPostalCode(savedProfileAddress.postalCode);
      setTerrainType(savedProfileAddress.terrainType);
    }
  };

  // 3. Save to Zustand and move to Payment
  const submitHandler = (e) => {
    e.preventDefault();
    saveShippingAddress({ address, city, postalCode, terrainType });
    navigate('/payment');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      {/* Assuming you have your CheckoutSteps component set up */}
      <CheckoutSteps step1 step2 step3 />

      <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Shipping details</h2>

      {/* AUTOFILL BANNER */}
      {savedProfileAddress && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae0ff', padding: '15px', borderRadius: '5px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#0050b3' }}>Saved Address Found</p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#0050b3' }}>{savedProfileAddress.street}, {savedProfileAddress.city}</p>
          </div>
          <button 
            type="button" 
            onClick={handleAutofill}
            style={{ padding: '8px 15px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            Autofill Form
          </button>
        </div>
      )}

      <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Street Address / Plus Code</label>
          <input 
            type="text" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="123 Main St" 
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} 
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>City</label>
            <input 
              type="text" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder="Clayton" 
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} 
              required 
            />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Zip Code</label>
            <input 
              type="text" 
              value={postalCode} 
              onChange={(e) => setPostalCode(e.target.value)} 
              placeholder="13624" 
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} 
              required 
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Delivery Terrain</label>
          <select 
            value={terrainType} 
            onChange={(e) => setTerrainType(e.target.value)} 
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: 'white' }}
          >
            <option value="Land">Land (Standard Street Delivery)</option>
            <option value="Water">Water (Island / Dock Delivery)</option>
          </select>
        </div>

        <button 
          type="submit" 
          style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '1rem' }}
        >
          Continue to Payment
        </button>
      </form>

    </div>
  );
};

export default ShippingScreen;