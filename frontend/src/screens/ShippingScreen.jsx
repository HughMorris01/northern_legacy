import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CheckoutSteps from '../components/CheckoutSteps';
import axios from '../axios';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { toast } from 'react-toastify';

const libraries = ['places', 'geometry'];
const STORE_COORDS = { lat: 44.3168, lng: -75.9452 };
const searchBounds = { north: 49.5, south: 39.0, east: -68.0, west: -83.0 };

const ShippingScreen = () => {
  const navigate = useNavigate();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const saveShippingAddress = useCartStore((state) => state.saveShippingAddress);

  // Form State
  const [address, setAddress] = useState('');
  const [aptNumber, setAptNumber] = useState(''); // NEW: Dedicated Apt State
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [terrainType, setTerrainType] = useState('Land');

  // Logic & Checkbox State
  const [savedProfileAddress, setSavedProfileAddress] = useState(null);
  const [useProfileAddress, setUseProfileAddress] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);

  // Google Maps State
  const [inputValue, setInputValue] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [status, setStatus] = useState(null); 
  const [message, setMessage] = useState('');
  const autocompleteRef = useRef(null);

  const verifyAddressString = (addressString) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: addressString }, (results, geocodeStatus) => {
      if (geocodeStatus === 'OK' && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        
        const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(STORE_COORDS),
          new window.google.maps.LatLng({ lat, lng })
        );
        const distanceInMiles = distanceInMeters / 1609.34;
        
        if (distanceInMiles <= 30) {
          setIsEligible(true);
          setStatus('success');
          setMessage(`✓ Profile Address Verified! You are ${distanceInMiles.toFixed(1)} miles away.`);
        } else {
          setIsEligible(false);
          setStatus('out-of-range');
          setMessage(`✕ Out of range. Your profile address is ${distanceInMiles.toFixed(1)} miles away.`);
        }
      } else {
        console.error('Google Geocoding API Error:', geocodeStatus);
        setIsEligible(false);
        setStatus('error');
        setMessage('Could not automatically verify your profile address. Please uncheck the box and enter it manually.');
      }
    });
  };

  useEffect(() => {
    const initAddress = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        if (data.address && data.address.street) {
          setSavedProfileAddress(data.address);
          setUseProfileAddress(true);
          
          setAddress(data.address.street);
          setAptNumber(''); // Clear any residual apt state
          setCity(data.address.city);
          setPostalCode(data.address.postalCode);
          setTerrainType(data.address.terrainType || 'Land');
          
          if (isLoaded) {
             verifyAddressString(`${data.address.street}, ${data.address.city}, NY ${data.address.postalCode}`);
          }
        }
      } catch {
        console.warn('No profile address found.');
      }
    };
    initAddress();
    // eslint-disable-next-line
  }, [isLoaded]);

  const handleUseProfileToggle = (e) => {
    const checked = e.target.checked;
    setUseProfileAddress(checked);
    
    if (checked && savedProfileAddress) {
      setAddress(savedProfileAddress.street);
      setAptNumber(''); // Clear apt input when using profile
      setCity(savedProfileAddress.city);
      setPostalCode(savedProfileAddress.postalCode);
      setTerrainType(savedProfileAddress.terrainType);
      verifyAddressString(`${savedProfileAddress.street}, ${savedProfileAddress.city}, NY ${savedProfileAddress.postalCode}`);
    } else {
      setAddress('');
      setAptNumber('');
      setCity('');
      setPostalCode('');
      setInputValue('');
      setIsEligible(false);
      setStatus(null);
      setMessage('');
      setSaveToProfile(false); 
    }
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        setIsEligible(false);
        setStatus('error');
        setMessage('Please select a valid address from the dropdown suggestions.');
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
        setAddress(newStreet);
        setAptNumber(''); // Clear the apt input for a fresh search
        setCity(parsedCity);
        setPostalCode(parsedPostalCode);
        setIsEligible(true);
      } else {
        setStatus('out-of-range');
        setIsEligible(false);
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
    if (!isEligible) return; 

    // Dynamically build the final street string based on whether they manually typed an Apt Number
    const finalStreet = (!useProfileAddress && aptNumber) ? `${address}, ${aptNumber}`.trim() : address;

    if (!useProfileAddress && saveToProfile) {
      try {
        await axios.put('/api/users/profile', {
          address: { street: finalStreet, city, postalCode, terrainType },
        });
        toast.success('Address securely saved to your profile!');
      } catch {
        toast.error('Failed to save address to profile.');
      }
    }

    // Save the combined street string to the local session for the checkout flow
    saveShippingAddress({ address: finalStreet, city, postalCode, terrainType });
    navigate('/payment');
  };

  if (loadError) return <div style={{ color: 'red', textAlign: 'center', marginTop: '40px' }}>Error loading map script. Check API key.</div>;
  if (!isLoaded) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading Delivery Map...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      <CheckoutSteps step1 step2 step3 />

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Delivery Details</h2>

        {savedProfileAddress && (
          <div style={{ marginBottom: '20px', padding: '15px', background: useProfileAddress ? '#e6f7ff' : '#f5f5f5', border: `1px solid ${useProfileAddress ? '#91d5ff' : '#ddd'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}>
            <input 
              type="checkbox" 
              id="useProfileCheck"
              checked={useProfileAddress}
              onChange={handleUseProfileToggle}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="useProfileCheck" style={{ color: useProfileAddress ? '#096dd9' : '#666', fontWeight: 'bold', cursor: 'pointer' }}>
              Use my saved Profile Delivery Address
            </label>
          </div>
        )}

        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {!useProfileAddress && (
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Search Address</label>
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
                      setIsEligible(false);
                      setMessage('Please select a valid address from the dropdown to continue.');
                    }
                  }}
                  placeholder="Start typing your street address..."
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1rem' }}
                />
              </Autocomplete>
            </div>
          )}

          {status === 'success' && (
            <div style={{ color: '#389e0d', fontWeight: 'bold', background: '#f6ffed', padding: '10px', borderRadius: '4px', border: '1px solid #b7eb8f' }}>
              {message}
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

          {/* PARSED DATA BLOCK: Handles Both Scenarios cleanly */}
          {status === 'success' && address && (
            <>
              {useProfileAddress ? (
                /* READ-ONLY DISPLAY FOR SAVED PROFILE ADDRESSES */
                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px dashed #ccc' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#666', fontSize: '0.85rem' }}>Saved Delivery Address</label>
                  <input 
                    type="text" 
                    value={`${address}, ${city}, NY ${postalCode}`} 
                    disabled 
                    style={{ width: '100%', padding: '10px', background: '#eaeaea', border: '1px solid #ccc', borderRadius: '4px', color: '#666', cursor: 'not-allowed', boxSizing: 'border-box' }} 
                  />
                </div>
              ) : (
                /* 3-BOX LAYOUT FOR MANUAL ENTRY */
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px dashed #ccc' }}>
                  <div style={{ flex: '2 1 200px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#666', fontSize: '0.85rem' }}>
                      Verified Street Address
                    </label>
                    <input 
                      type="text" 
                      value={address} 
                      disabled 
                      style={{ width: '100%', padding: '10px', background: '#eaeaea', border: '1px solid #ccc', borderRadius: '4px', color: '#666', cursor: 'not-allowed', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#666', fontSize: '0.85rem' }}>
                      Unit/Apt Number
                    </label>
                    <input 
                      type="text" 
                      value={aptNumber} 
                      onChange={(e) => setAptNumber(e.target.value)} 
                      placeholder="Apt 4B"
                      style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #1890ff', borderRadius: '4px', color: '#111', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#666', fontSize: '0.85rem' }}>City & Zip</label>
                    <input 
                      type="text" 
                      value={`${city}, ${postalCode}`} 
                      disabled 
                      style={{ width: '100%', padding: '10px', background: '#eaeaea', border: '1px solid #ccc', borderRadius: '4px', color: '#666', cursor: 'not-allowed', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {status === 'success' && (
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Delivery Terrain</label>
              <select 
                value={terrainType} 
                onChange={(e) => setTerrainType(e.target.value)}
                disabled={useProfileAddress} 
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: useProfileAddress ? '#f5f5f5' : 'white', fontSize: '1rem', cursor: useProfileAddress ? 'not-allowed' : 'pointer' }}
              >
                <option value="Land">Land (Standard Street Delivery)</option>
                <option value="Water">Water (Island / Dock Delivery)</option>
              </select>
            </div>
          )}

          {!useProfileAddress && status === 'success' && (
            <div style={{ padding: '12px', background: '#fafafa', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
              <input 
                type="checkbox" 
                id="saveToProfileCheck"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="saveToProfileCheck" style={{ color: '#333', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>
                Add this delivery address to my Profile
              </label>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!isEligible}
            style={{ 
              width: '100%', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', marginTop: '10px', fontSize: '1.1rem',
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
    </div>
  );
};

export default ShippingScreen;