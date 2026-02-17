import { useState, useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

// This must be declared outside the component so it doesn't trigger endless re-renders
const libraries = ['places', 'geometry'];

// Coordinates for 42901 NY-12, Alexandria Bay, NY 13607
const STORE_COORDS = { lat: 44.3168, lng: -75.9452 };

const DeliveryChecker = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [status, setStatus] = useState(null); // 'success', 'error', 'out-of-range'
  const [message, setMessage] = useState('');
  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        setStatus('error');
        setMessage('Please select a valid address from the dropdown suggestions.');
        return;
      }

      const customerCoords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      // Calculate distance using Google's Geometry library (returns meters)
      const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(STORE_COORDS),
        new window.google.maps.LatLng(customerCoords)
      );

      // Convert to miles
      const distanceInMiles = distanceInMeters / 1609.34;

      // The silent 30-mile allowance
      if (distanceInMiles <= 30) {
        setStatus('success');
        setMessage(`Great news! You are ${distanceInMiles.toFixed(1)} miles away. We deliver to your location.`);
      } else {
        setStatus('out-of-range');
        setMessage(`Sorry, you are ${distanceInMiles.toFixed(1)} miles away. We currently only deliver within 25 miles of our Alexandria Bay store.`);
      }
    }
  };

  if (loadError) return <div style={{ color: 'red' }}>Error loading map script. Check API key.</div>;
  if (!isLoaded) return <div>Loading address checker...</div>;

  return (
    <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px', textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Check Delivery Eligibility</h3>
      <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#666' }}>Enter your address to see if you are within our 25-mile delivery zone.</p>
      
      <Autocomplete 
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
        // Restrict search to the US
        options={{ componentRestrictions: { country: 'us' } }} 
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
        <div style={{ marginTop: '15px', color: '#cf1322', fontWeight: 'bold', background: '#fff2f0', padding: '10px', borderRadius: '4px', border: '1px solid #ffccc7' }}>
          ✕ {message}
        </div>
      )}
      {status === 'error' && (
        <div style={{ marginTop: '15px', color: '#d48806', fontWeight: 'bold', background: '#fffbe6', padding: '10px', borderRadius: '4px', border: '1px solid #ffe58f' }}>
          ⚠️ {message}
        </div>
      )}
    </div>
  );
};

export default DeliveryChecker;