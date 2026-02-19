import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import axios from '../axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

const libraries = ['places', 'geometry'];

// Store Address: 42901 NY-12, Suite B, Alexandria Bay, NY 13607
const STORE_COORDS = { lat: 44.3168, lng: -75.9452 };

// Expanded Bounding Box (~350 miles)
const searchBounds = {
  north: 49.5,
  south: 39.0,
  east: -68.0,
  west: -83.0,
};

const EditDeliveryScreen = () => {
  const navigate = useNavigate();
  const updateUserInfo = useAuthStore((state) => state.updateUserInfo);

  // Address State
  const [street, setStreet] = useState('');
  const [aptNumber, setAptNumber] = useState(''); 
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [terrainType, setTerrainType] = useState('Land');
  const [syncAddresses, setSyncAddresses] = useState(false);

  // NEW: State to track if they are actively modifying the address
  const [isNewSearch, setIsNewSearch] = useState(false);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Google Maps State
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState(null); 
  const [message, setMessage] = useState('');
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        if (data.address && data.address.street) {
          
          // THE FIX: Parse out the apartment number if it exists in the saved string
          let loadedStreet = data.address.street;
          let loadedApt = '';
          
          if (loadedStreet.includes(', ')) {
            const parts = loadedStreet.split(', ');
            loadedStreet = parts[0];
            loadedApt = parts.slice(1).join(', '); // Joins any remaining parts back together
          }

          setStreet(loadedStreet);
          setAptNumber(loadedApt);
          setCity(data.address.city);
          setPostalCode(data.address.postalCode);
          setTerrainType(data.address.terrainType || 'Land');
          
          setStatus('success');
          setMessage('Your current delivery address is verified and within range.');
          setInputValue(`${data.address.street}, ${data.address.city} ${data.address.postalCode}`);
          
          // Ensure the box stays locked because this is an existing profile address
          setIsNewSearch(false);
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

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        setStatus('error');
        setMessage('Please select a valid address from the dropdown suggestions.');
        setIsNewSearch(false);
        return;
      }

      const customerCoords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(STORE_COORDS),
        new window.google.maps.LatLng(customerCoords)
      );
      const distanceInMiles = distanceInMeters / 1609.34;

      let streetNumber = '';
      let route = '';
      let parsedCity = '';
      let parsedPostalCode = '';
      let countryCode = '';

      place.address_components?.forEach((comp) => {
        const types = comp.types;
        if (types.includes('street_number')) streetNumber = comp.short_name;
        if (types.includes('route')) route = comp.short_name;
        if (types.includes('locality') || types.includes('sublocality')) parsedCity = comp.long_name;
        if (types.includes('postal_code')) parsedPostalCode = comp.short_name;
        if (types.includes('country')) countryCode = comp.short_name; 
      });

      const newStreet = `${streetNumber} ${route}`.trim();
      setInputValue(`${newStreet}, ${parsedCity} ${parsedPostalCode}`);

      if (distanceInMiles <= 30) {
        setStatus('success');
        setMessage(`Address verified! You are ${distanceInMiles.toFixed(1)} miles away.`);
        setStreet(newStreet);
        setAptNumber(''); // Clear the apt number on a fresh search
        setCity(parsedCity);
        setPostalCode(parsedPostalCode);
        
        // THE FIX: Unlock the apartment box!
        setIsNewSearch(true);
      } else {
        setStatus('out-of-range');
        setIsNewSearch(false); // Keep it locked
        if (countryCode === 'CA') {
          setMessage(`You are ${distanceInMiles.toFixed(1)} miles away across the border in Canada! We currently only deliver within 25 miles of our Alexandria Bay store.`);
        } else {
          setMessage(`You are ${distanceInMiles.toFixed(1)} miles away! We currently only deliver within 25 miles of our Alexandria Bay store.`);
        }
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      
      const finalSync = terrainType === 'Land' ? syncAddresses : false;
      const finalStreet = aptNumber ? `${street}, ${aptNumber}`.trim() : street;
      
      const payload = {
        address: { street: finalStreet, city, postalCode, terrainType },
        syncAddresses: finalSync,
      };

      if (finalSync) {
        payload.mailOptIn = true;
      }

      const { data } = await axios.put('/api/users/profile', payload);

      updateUserInfo(data);
      toast.success('Delivery Address Updated!');
      navigate('/profile'); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update address');
      setUpdateLoading(false);
    }
  };

  if (loadError) return <div style={{ color: 'red', textAlign: 'center', marginTop: '40px' }}>Error loading map script. Check API key.</div>;
  if (!isLoaded || loading) return <Loader />;

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
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Search New Address</label>
            <Autocomplete 
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={handlePlaceChanged}
              options={{ 
                bounds: searchBounds,
                strictBounds: true,
                componentRestrictions: { country: ['us', 'ca'] }, 
                fields: ['address_components', 'geometry'] 
              }} 
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (status === 'success') {
                    setStatus(null);
                    setIsNewSearch(false); // Lock the apartment box immediately if they tamper with the string
                    setMessage('Please select a valid address from the dropdown to continue.');
                  }
                }}
                placeholder="Start typing your address..."
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }}
              />
            </Autocomplete>
          </div>

          {status === 'success' && (
            <div style={{ color: '#389e0d', fontWeight: 'bold', background: '#f6ffed', padding: '10px', borderRadius: '4px', border: '1px solid #b7eb8f' }}>
              ✓ {message}
            </div>
          )}
          {status === 'out-of-range' && (
            <div style={{ color: '#cf1322', fontWeight: 'bold', background: '#fff2f0', padding: '10px', borderRadius: '4px', border: '1px solid #ffccc7', lineHeight: '1.4' }}>
              {message.includes('Canada') ? '🍁' : '🚁'} {message}
            </div>
          )}
          {status === 'error' && (
            <div style={{ color: '#d48806', fontWeight: 'bold', background: '#fffbe6', padding: '10px', borderRadius: '4px', border: '1px solid #ffe58f' }}>
              ⚠️ {message}
            </div>
          )}

          {street && status === 'success' && (
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px dashed #ccc' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#666', fontSize: '0.85rem' }}>
                  Verified Street Address
                </label>
                <input 
                  type="text" 
                  value={street} 
                  disabled 
                  style={{ width: '100%', padding: '10px', background: '#eaeaea', border: '1px solid #ccc', borderRadius: '4px', color: '#666', cursor: 'not-allowed', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#666', fontSize: '0.85rem' }}>
                  Unit/Apt Number
                </label>
                <input 
                  type="text" 
                  value={aptNumber} 
                  onChange={(e) => setAptNumber(e.target.value)} 
                  placeholder="Apt 4B"
                  disabled={!isNewSearch}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    background: isNewSearch ? '#fff' : '#eaeaea', 
                    border: isNewSearch ? '1px solid #1890ff' : '1px solid #ccc', 
                    borderRadius: '4px', 
                    color: isNewSearch ? '#111' : '#666', 
                    cursor: isNewSearch ? 'text' : 'not-allowed',
                    boxSizing: 'border-box' 
                  }} 
                />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#666', fontSize: '0.85rem' }}>City & Zip</label>
                <input 
                  type="text" 
                  value={`${city}, ${postalCode}`} 
                  disabled 
                  style={{ width: '100%', padding: '10px', background: '#eaeaea', border: '1px solid #ccc', borderRadius: '4px', color: '#666', cursor: 'not-allowed', boxSizing: 'border-box' }} 
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Delivery Terrain</label>
            <select 
              value={terrainType} 
              onChange={(e) => {
                setTerrainType(e.target.value);
                if (e.target.value === 'Water') setSyncAddresses(false);
              }} 
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem', background: '#fff' }}
            >
              <option value="Land">Land (Standard Street Address)</option>
              <option value="Water">Water (Island / Dock Delivery)</option>
            </select>
          </div>

          <div style={{ padding: '15px', background: terrainType === 'Water' ? '#f5f5f5' : '#e6f7ff', border: `1px solid ${terrainType === 'Water' ? '#ddd' : '#91d5ff'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input 
              type="checkbox" 
              id="syncCheck"
              checked={syncAddresses}
              onChange={(e) => setSyncAddresses(e.target.checked)}
              disabled={terrainType === 'Water'} 
              style={{ width: '18px', height: '18px', cursor: terrainType === 'Water' ? 'not-allowed' : 'pointer' }}
            />
            <label htmlFor="syncCheck" style={{ color: terrainType === 'Water' ? '#999' : '#096dd9', fontWeight: 'bold', cursor: terrainType === 'Water' ? 'not-allowed' : 'pointer' }}>
              Also use this as my primary Marketing Address
            </label>
          </div>

          <button 
            type="submit" 
            disabled={updateLoading || status !== 'success' || !street} 
            style={{ width: '100%', padding: '15px', background: (updateLoading || status !== 'success' || !street) ? '#ccc' : 'black', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.1rem', cursor: (updateLoading || status !== 'success' || !street) ? 'not-allowed' : 'pointer', marginTop: '10px' }}
          >
            {updateLoading ? 'Saving...' : 'Save Delivery Address'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default EditDeliveryScreen;