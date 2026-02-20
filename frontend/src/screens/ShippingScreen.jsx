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
  const [aptNumber, setAptNumber] = useState(''); 
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [terrainType, setTerrainType] = useState('Land');
  
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

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

  // Delivery Scheduling State
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); 

  const fetchDeliverySlots = async (latitude, longitude) => {
    setSlotsLoading(true);
    setSelectedSlot(null); 
    try {
      const { data } = await axios.post('/api/delivery/slots', { lat: latitude, lng: longitude });
      setDeliverySlots(data);
    } catch (err) {
      toast.error('Failed to load delivery schedules. Please try again.');
      console.error(err);
    }
    setSlotsLoading(false);
  };

  useEffect(() => {
    const initAddress = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        
        // Strictly require lat and lng from the database to present the saved option
        if (data.address && data.address.street && data.address.lat && data.address.lng) {
          setSavedProfileAddress(data.address);
          setUseProfileAddress(true);
          
          setAddress(data.address.street);
          setAptNumber(''); 
          setCity(data.address.city);
          setPostalCode(data.address.postalCode);
          setTerrainType(data.address.terrainType || 'Land');
          
          setLat(data.address.lat);
          setLng(data.address.lng);
          
          setIsEligible(true);
          setStatus('success');
          setMessage('✓ Saved Profile Address Loaded!');
          
          fetchDeliverySlots(data.address.lat, data.address.lng);
        }
      } catch {
        console.warn('No valid profile address found.');
      }
    };
    
    initAddress();
  }, []); 

  const handleUseProfileToggle = (e) => {
    const checked = e.target.checked;
    setUseProfileAddress(checked);
    
    if (checked && savedProfileAddress && savedProfileAddress.lat) {
      setAddress(savedProfileAddress.street);
      setAptNumber(''); 
      setCity(savedProfileAddress.city);
      setPostalCode(savedProfileAddress.postalCode);
      setTerrainType(savedProfileAddress.terrainType);
      
      setLat(savedProfileAddress.lat);
      setLng(savedProfileAddress.lng);
      setIsEligible(true);
      setStatus('success');
      setMessage('✓ Saved Profile Address Loaded!');
      fetchDeliverySlots(savedProfileAddress.lat, savedProfileAddress.lng);
      
    } else {
      setAddress('');
      setAptNumber('');
      setCity('');
      setPostalCode('');
      setLat(null);
      setLng(null);
      setInputValue('');
      setIsEligible(false);
      setStatus(null);
      setMessage('');
      setSaveToProfile(false); 
      setDeliverySlots([]); 
      setSelectedSlot(null);
    }
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        setIsEligible(false);
        setStatus('error');
        setMessage('Please select a valid address from the dropdown suggestions.');
        setDeliverySlots([]);
        return;
      }

      const selectedLat = place.geometry.location.lat();
      const selectedLng = place.geometry.location.lng();

      const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(STORE_COORDS),
        new window.google.maps.LatLng({ lat: selectedLat, lng: selectedLng })
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
        setAptNumber(''); 
        setCity(parsedCity);
        setPostalCode(parsedPostalCode);
        setLat(selectedLat);
        setLng(selectedLng);
        setIsEligible(true);

        fetchDeliverySlots(selectedLat, selectedLng);
      } else {
        setStatus('out-of-range');
        setIsEligible(false);
        setDeliverySlots([]);
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
    if (!isEligible || !selectedSlot) return; 

    const finalStreet = (!useProfileAddress && aptNumber) ? `${address}, ${aptNumber}`.trim() : address;

    if (!useProfileAddress && saveToProfile) {
      try {
        await axios.put('/api/users/profile', {
          address: { street: finalStreet, city, postalCode, terrainType, lat, lng },
        });
        toast.success('Address securely saved to your profile!');
      } catch {
        toast.error('Failed to save address to profile.');
      }
    }

    saveShippingAddress({ 
      address: finalStreet, 
      city, 
      postalCode, 
      terrainType,
      deliveryDate: selectedSlot.date,
      deliveryTimeSlot: selectedSlot.time
    });
    
    navigate('/payment');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      <CheckoutSteps step1 step2 step3 />

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Delivery Details</h2>

        {savedProfileAddress && savedProfileAddress.lat && (
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
              
              {loadError ? (
                <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '10px' }}>
                  Error loading map. Please check your connection or use a saved profile address.
                </div>
              ) : !isLoaded ? (
                <input
                  type="text"
                  disabled
                  placeholder="Loading address search..."
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1rem', background: '#f5f5f5', cursor: 'wait' }}
                />
              ) : (
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
                        setDeliverySlots([]);
                        setSelectedSlot(null);
                      }
                    }}
                    placeholder="Start typing your street address..."
                    style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1rem' }}
                  />
                </Autocomplete>
              )}
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

          {status === 'success' && address && (
            <>
              {useProfileAddress ? (
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

          {status === 'success' && (
            <div style={{ marginTop: '10px', borderTop: '2px solid #eaeaea', paddingTop: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>Select Delivery Window</h3>
              
              {slotsLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
                  Calculating optimal routes...
                </div>
              ) : deliverySlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#cf1322', background: '#fff2f0', borderRadius: '8px', border: '1px solid #ffccc7' }}>
                  No delivery windows available at this time.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {deliverySlots.map((dayObj) => (
                    <div key={dayObj.date} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ background: '#f5f5f5', padding: '10px 15px', fontWeight: 'bold', borderBottom: '1px solid #ddd', fontSize: '1.05rem' }}>
                        {dayObj.dayName} ({dayObj.date})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
                        {dayObj.slots.map((slot) => {
                          const isAvailable = slot.status === 'Open' || slot.status === 'Anchored';
                          const isSelected = selectedSlot?.date === dayObj.date && selectedSlot?.time === slot.time;
                          
                          return (
                            <button
                              key={`${dayObj.date}-${slot.time}`}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => setSelectedSlot({ date: dayObj.date, time: slot.time })}
                              style={{
                                padding: '15px', textAlign: 'left', cursor: isAvailable ? 'pointer' : 'not-allowed',
                                border: 'none', borderBottom: '1px solid #eee',
                                background: isSelected ? '#fffbe6' : isAvailable ? 'white' : '#fafafa',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s',
                                width: '100%', boxSizing: 'border-box'
                              }}
                            >
                              <div>
                                <span style={{ display: 'block', fontWeight: 'bold', color: isAvailable ? (isSelected ? '#d48806' : '#111') : '#999', fontSize: '1.05rem', marginBottom: '2px', textDecoration: !isAvailable ? 'line-through' : 'none' }}>
                                  {slot.time}
                                </span>
                                {!isAvailable && (
                                  <span style={{ fontSize: '0.8rem', color: '#cf1322', fontWeight: 'bold' }}>
                                    {slot.reason || slot.status}
                                  </span>
                                )}
                              </div>
                              
                              {isSelected && <span style={{ color: '#d48806', fontWeight: 'bold', fontSize: '1.1rem' }}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            disabled={!isEligible || !selectedSlot}
            style={{ 
              width: '100%', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', marginTop: '10px', fontSize: '1.1rem',
              background: (isEligible && selectedSlot) ? 'black' : '#ccc', 
              color: (isEligible && selectedSlot) ? 'white' : '#666',
              cursor: (isEligible && selectedSlot) ? 'pointer' : 'not-allowed',
              transition: 'background 0.3s'
            }}
          >
            {isEligible 
              ? (selectedSlot ? 'Confirm Window & Continue' : 'Select a Delivery Window ↑') 
              : 'Enter Valid Address to Continue'
            }
          </button>
        </form>

      </div>
    </div>
  );
};

export default ShippingScreen;