import { useState, useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from '../axios';
import { toast } from 'react-toastify';

const libraries = ['places', 'geometry'];

const STORE_COORDS = { lat: 44.3168, lng: -75.9452 };

const searchBounds = {
  north: 49.5,
  south: 39.0,
  east: -68.0,
  west: -83.0,
};

const DeliveryChecker = () => {
  const navigate = useNavigate();
  const userInfo = useAuthStore((state) => state.userInfo);
  const updateUserInfo = useAuthStore((state) => state.updateUserInfo);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [status, setStatus] = useState(null); 
  const [message, setMessage] = useState('');
  const [parsedAddress, setParsedAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        setStatus('error');
        setMessage('Please select a valid address from the dropdown suggestions.');
        setParsedAddress(null);
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
      let city = '';
      let postalCode = '';
      let countryCode = '';

      place.address_components?.forEach((comp) => {
        const types = comp.types;
        if (types.includes('street_number')) streetNumber = comp.short_name;
        if (types.includes('route')) route = comp.short_name;
        if (types.includes('locality') || types.includes('sublocality')) city = comp.long_name;
        if (types.includes('postal_code')) postalCode = comp.short_name;
        if (types.includes('country')) countryCode = comp.short_name; 
      });

      setParsedAddress({
        street: `${streetNumber} ${route}`.trim(),
        city,
        postalCode,
        terrainType: 'Land' 
      });

      if (distanceInMiles <= 30) {
        setStatus('success');
        setMessage(`Great news! You are ${distanceInMiles.toFixed(1)} miles away. We deliver to your location.`);
      } else {
        setStatus('out-of-range');
        if (countryCode === 'CA') {
          setMessage(`You are ${distanceInMiles.toFixed(1)} miles away across the border in Canada! We currently only deliver within 25 miles of our Alexandria Bay store.`);
        } else {
          setMessage(`You are ${distanceInMiles.toFixed(1)} miles away! We currently only deliver within 25 miles of our Alexandria Bay store. Our drone delivery fleet is still under construction, so check back later!`);
        }
      }
    }
  };

  const saveAddressHandler = async () => {
    if (!userInfo) {
      navigate('/register?redirect=/profile');
      return;
    }

    try {
      setSaving(true);
      const { data } = await axios.put('/api/users/profile', { address: parsedAddress });
      updateUserInfo(data);
      toast.success('Address securely saved to your profile!');
      setParsedAddress(null); 
      setSaving(false);
    } catch {
      toast.error('Failed to save address to profile.');
      setSaving(false);
    }
  };

  if (loadError) return <div style={{ color: 'red' }}>Error loading map script. Check API key.</div>;
  if (!isLoaded) return <div>Loading address checker...</div>;

  return (
    // THE FIX: Aggressively condensed padding and margins (40% height reduction)
    <div style={{ background: '#f5f5f5', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px', textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Check Delivery Eligibility</h3>
      <p style={{ margin: '0 0 10px 0', fontSize: '0.70rem', color: '#666' }}>Enter your address to see if you are within our delivery zone.</p>
      
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
          placeholder="Start typing your address..."
          style={{ width: '100%', maxWidth: '400px', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '0.95rem' }}
        />
      </Autocomplete>

      {/* THE FIX: Shrunk message padding and fonts */}
      {status === 'success' && (
        <div style={{ marginTop: '10px', color: '#389e0d', fontWeight: 'bold', background: '#f6ffed', padding: '8px', borderRadius: '4px', border: '1px solid #b7eb8f', fontSize: '0.9rem' }}>
          ✓ {message}
        </div>
      )}
      {status === 'out-of-range' && (
        <div style={{ marginTop: '10px', color: '#cf1322', fontWeight: 'bold', background: '#fff2f0', padding: '8px', borderRadius: '4px', border: '1px solid #ffccc7', lineHeight: '1.3', fontSize: '0.9rem' }}>
          {message.includes('Canada') ? '🍁' : '🚁'} {message}
        </div>
      )}
      {status === 'error' && (
        <div style={{ marginTop: '10px', color: '#d48806', fontWeight: 'bold', background: '#fffbe6', padding: '8px', borderRadius: '4px', border: '1px solid #ffe58f', fontSize: '0.9rem' }}>
          ⚠️ {message}
        </div>
      )}

      {parsedAddress && status === 'success' && (
        <button 
          onClick={saveAddressHandler}
          disabled={saving}
          style={{ 
            marginTop: '10px', padding: '8px 16px', background: 'black', color: 'white', 
            border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' 
          }}
        >
          {saving ? 'Saving...' : (!userInfo ? 'Login / Create an Account Now' : 'Save this Address to my Profile')}
        </button>
      )}
    </div>
  );
};

export default DeliveryChecker;