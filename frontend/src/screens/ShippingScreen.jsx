import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CheckoutSteps from '../components/CheckoutSteps';
import axios from '../axios';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

// Required Google libraries
const libraries = ['places', 'geometry'];
// Coordinates for 42901 NY-12, Alexandria Bay, NY 13607
const STORE_COORDS = { lat: 44.3168, lng: -75.9452 };

const ShippingScreen = () => {
  const navigate = useNavigate();

  // Load the Google Maps script
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const saveShippingAddress = useCartStore((state) => state.saveShippingAddress);

  // Form State
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [terrainType, setTerrainType] = useState(shippingAddress?.terrainType || 'Land');

  // Delivery Verification State
  const [savedProfileAddress, setSavedProfileAddress] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [distanceMsg, setDistanceMsg] = useState('');
  const autocompleteRef = useRef(null);

  // 1. Fetch default profile address on load
  useEffect(() => {
    const fetchProfileAddress = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        if (data.address && data.address.street) {
          setSavedProfileAddress(data.address);
        }
      } catch {
        console.warn('No profile address found.');
      }
    };
    fetchProfileAddress();
  }, []);

  // 2. The Math: Calculate distance from store
  const checkDistance = (lat, lng) => {
    const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(STORE_COORDS),
      new window.google.maps.LatLng({ lat, lng })
    );
    const distanceInMiles = distanceInMeters / 1609.34;

    if (distanceInMiles <= 30) {
      setIsEligible(true);
      setDistanceMsg(`✓ Delivery verified! You are ${distanceInMiles.toFixed(1)} miles away.`);
    } else {
      setIsEligible(false);
      setDistanceMsg(`✕ Out of range. You are ${distanceInMiles.toFixed(1)} miles away. We only deliver within 25 miles of our store.`);
    }
  };

  // 3. Helper to geocode a text string (used for Autofill button)
  const verifyAddressString = (addressString) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: addressString }, (results, status) => {
      if (status === 'OK' && results[0]) {
        checkDistance(results[0].geometry.location.lat(), results[0].geometry.location.lng());
      } else {
        setIsEligible(false);
        setDistanceMsg('Could not verify distance. Please use the search bar to find your address.');
      }
    });
  };

  // 4. Re-verify address if they navigate back to this screen from Payment
  useEffect(() => {
    if (isLoaded && address && city && !isEligible) {
      verifyAddressString(`${address}, ${city}, NY ${postalCode}`);
    }
    // eslint-disable-next-line
  }, [isLoaded]);

  // 5. Google Autocomplete Dropdown Selection Handler
  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        setIsEligible(false);
        setDistanceMsg('Please select a valid address from the dropdown suggestions.');
        return;
      }

      // Automatically slice up the Google data to fill your form
      let streetNum = '';
      let route = '';
      let parsedCity = '';
      let parsedZip = '';

      place.address_components?.forEach((comp) => {
        if (comp.types.includes('street_number')) streetNum = comp.long_name;
        if (comp.types.includes('route')) route = comp.short_name;
        if (comp.types.includes('locality')) parsedCity = comp.long_name;
        if (comp.types.includes('postal_code')) parsedZip = comp.long_name;
      });

      setAddress(`${streetNum} ${route}`.trim());
      setCity(parsedCity);
      setPostalCode(parsedZip);

      // Instantly check distance using the coordinates
      checkDistance(place.geometry.location.lat(), place.geometry.location.lng());
    }
  };

  // 6. Autofill Button Handler
  const handleAutofill = () => {
    if (savedProfileAddress) {
      setAddress(savedProfileAddress.street);
      setCity(savedProfileAddress.city);
      setPostalCode(savedProfileAddress.postalCode);
      setTerrainType(savedProfileAddress.terrainType);
      
      // Silently verify the profile address distance in the background
      verifyAddressString(`${savedProfileAddress.street}, ${savedProfileAddress.city}, NY ${savedProfileAddress.postalCode}`);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!isEligible) return; // Double protection
    saveShippingAddress({ address, city, postalCode, terrainType });
    navigate('/payment');
  };

  if (!isLoaded) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Delivery Map...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      <CheckoutSteps step1 step2 step3 />

      <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Delivery Details</h2>

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

      {/* DYNAMIC WARNING BANNER */}
      {distanceMsg && (
        <div style={{ 
          background: isEligible ? '#f6ffed' : '#fff2f0', 
          border: `1px solid ${isEligible ? '#b7eb8f' : '#ffccc7'}`, 
          color: isEligible ? '#389e0d' : '#cf1322', 
          padding: '12px', borderRadius: '4px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' 
        }}>
          {distanceMsg}
        </div>
      )}

      <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Search Address</label>
          <Autocomplete 
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}
            options={{ componentRestrictions: { country: 'us' } }} 
          >
            <input 
              type="text" 
              value={address} 
              onChange={(e) => {
                setAddress(e.target.value);
                setIsEligible(false); // If they type manually, force them to verify
              }} 
              placeholder="Start typing your street address..." 
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} 
              required 
            />
          </Autocomplete>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>City</label>
            <input 
              type="text" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#f5f5f5' }} 
              readOnly
            />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Zip Code</label>
            <input 
              type="text" 
              value={postalCode} 
              onChange={(e) => setPostalCode(e.target.value)} 
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#f5f5f5' }} 
              readOnly 
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
          disabled={!isEligible}
          style={{ 
            width: '100%', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', marginTop: '10px', fontSize: '1rem',
            background: isEligible ? 'black' : '#ccc', 
            color: isEligible ? 'white' : '#666',
            cursor: isEligible ? 'pointer' : 'not-allowed',
            transition: 'background 0.3s'
          }}
        >
          {isEligible ? 'Continue to Payment' : 'Enter Valid Address to Continue'}
        </button>
      </form>

    </div>
  );
};

export default ShippingScreen;