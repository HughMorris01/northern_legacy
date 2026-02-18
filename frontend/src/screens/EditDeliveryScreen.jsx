import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const EditDeliveryScreen = () => {
  const navigate = useNavigate();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [terrainType, setTerrainType] = useState('Land');
  const [syncAddresses, setSyncAddresses] = useState(false);

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        if (data.address) {
          setStreet(data.address.street || '');
          setCity(data.address.city || '');
          setPostalCode(data.address.postalCode || '');
          setTerrainType(data.address.terrainType || 'Land');
        }
        setSyncAddresses(data.syncAddresses || false);
        setLoading(false);
      } catch {
        toast.error('Failed to load delivery profile.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      
      // Send the updated address and the sync preference to the backend
      await axios.put('/api/users/profile', {
        address: { street, city, postalCode, terrainType },
        syncAddresses: terrainType === 'Land' ? syncAddresses : false, // Failsafe
      });

      toast.success('Delivery Address Updated!');
      navigate('/profile'); // Send them back to the dashboard!
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update address');
      setUpdateLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 15px', fontFamily: 'sans-serif' }}>
      
      <Link to="/profile" style={{ display: 'inline-block', marginBottom: '20px', textDecoration: 'none', color: '#1890ff', fontWeight: 'bold' }}>
        &larr; Back to Profile
      </Link>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h1 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          Edit Delivery Address
        </h1>
        
        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Street Address / Plus Code</label>
            <input 
              type="text" 
              value={street} 
              onChange={(e) => setStreet(e.target.value)} 
              placeholder="123 Main St" 
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }} 
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 200px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>City</label>
              <input 
                type="text" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                placeholder="Clayton" 
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }} 
                required
              />
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Zip Code</label>
              <input 
                type="text" 
                value={postalCode} 
                onChange={(e) => setPostalCode(e.target.value)} 
                placeholder="13624" 
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }} 
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Delivery Terrain</label>
            <select 
              value={terrainType} 
              onChange={(e) => {
                setTerrainType(e.target.value);
                // Automatically uncheck if they switch to Water
                if (e.target.value === 'Water') setSyncAddresses(false);
              }} 
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem', background: '#fff' }}
            >
              <option value="Land">Land (Standard Street Address)</option>
              <option value="Water">Water (Island / Dock Delivery)</option>
            </select>
          </div>

          {/* THE SYNC CHECKBOX */}
          <div style={{ padding: '15px', background: terrainType === 'Water' ? '#f5f5f5' : '#e6f7ff', border: `1px solid ${terrainType === 'Water' ? '#ddd' : '#91d5ff'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input 
              type="checkbox" 
              id="syncCheck"
              checked={syncAddresses}
              onChange={(e) => setSyncAddresses(e.target.checked)}
              disabled={terrainType === 'Water'} // Lock it out for water!
              style={{ width: '18px', height: '18px', cursor: terrainType === 'Water' ? 'not-allowed' : 'pointer' }}
            />
            <label htmlFor="syncCheck" style={{ color: terrainType === 'Water' ? '#999' : '#096dd9', fontWeight: 'bold', cursor: terrainType === 'Water' ? 'not-allowed' : 'pointer' }}>
              Also use this as my primary Mailing Address
            </label>
          </div>

          <button 
            type="submit" 
            disabled={updateLoading} 
            style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.1rem', cursor: updateLoading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
          >
            {updateLoading ? 'Saving...' : 'Save Delivery Address'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default EditDeliveryScreen;