import { useState, useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from '../axios';
import { toast } from 'react-toastify';

const libraries = ['places', 'geometry'];

// Store Address: 42901 NY-12, Suite B, Alexandria Bay, NY 13607
const STORE_COORDS = { lat: 44.3168, lng: -75.9452 };

// Expanded Bounding Box (~350 miles to cover NYC and Southern Ontario)
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

      // 1. Extract the coordinates for distance math
      const customerCoords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(STORE_COORDS),
        new window.google.maps.LatLng(customerCoords)
      );
      const distanceInMiles = distanceInMeters / 1609.34;

      // 2. Parse the address components
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

      // 3. Set the dynamic messaging
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
    <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px', textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Check Delivery Eligibility</h3>
      <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#666' }}>Enter your address to see if you are within our delivery zone.</p>
      
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
          style={{ width: '100%', maxWidth: '400px', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1rem' }}
        />
      </Autocomplete>

      {/* Dynamic Status Messages */}
      {status === 'success' && (
        <div style={{ marginTop: '15px', color: '#389e0d', fontWeight: 'bold', background: '#f6ffed', padding: '10px', borderRadius: '4px', border: '1px solid #b7eb8f' }}>
          ✓ {message}
        </div>
      )}
      {status === 'out-of-range' && (
        <div style={{ marginTop: '15px', color: '#cf1322', fontWeight: 'bold', background: '#fff2f0', padding: '10px', borderRadius: '4px', border: '1px solid #ffccc7', lineHeight: '1.4' }}>
          {message.includes('Canada') ? '🍁' : '🚁'} {message}
        </div>
      )}
      {status === 'error' && (
        <div style={{ marginTop: '15px', color: '#d48806', fontWeight: 'bold', background: '#fffbe6', padding: '10px', borderRadius: '4px', border: '1px solid #ffe58f' }}>
          ⚠️ {message}
        </div>
      )}

      {/* THE FIX: Save Address Button logic updated */}
      {parsedAddress && status === 'success' && (
        <button 
          onClick={saveAddressHandler}
          disabled={saving}
          style={{ 
            marginTop: '15px', padding: '10px 20px', background: 'black', color: 'white', 
            border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer' 
          }}
        >
          {saving ? 'Saving...' : (!userInfo ? 'Login / Create an Account Now' : 'Save this Address to my Profile')}
        </button>
      )}
    </div>
  );
};

export default DeliveryChecker;