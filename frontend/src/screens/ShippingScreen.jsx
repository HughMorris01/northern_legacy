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

  // UI Flow State
  const [step, setStep] = useState(1); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [expandedDays, setExpandedDays] = useState([0]); // Index 0 is open by default

  // Delivery Scheduling State
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); 

  const fetchDeliverySlots = async (latitude, longitude) => {
    setSlotsLoading(true);
    setSelectedSlot(null); 
    setExpandedDays([0]); // Reset accordion when new address loads
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
    setStep(1); 
    
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
        setMessage('Please select a valid address from the dropdown.');
        setDeliverySlots([]);
        setStep(1);
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

      place.address_components?.forEach((comp) => {
        const types = comp.types;
        if (types.includes('street_number')) streetNumber = comp.short_name;
        if (types.includes('route')) route = comp.short_name;
        if (types.includes('locality') || types.includes('sublocality')) parsedCity = comp.long_name;
        if (types.includes('postal_code')) parsedPostalCode = comp.short_name;
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
        setStep(1);
        setMessage(`You are ${distanceInMiles.toFixed(1)} miles away. We only deliver within 25 miles of Alexandria Bay.`);
      }
    }
  };

  const finalizeShipping = async () => {
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
    
    setShowConfirmModal(false);
    navigate('/payment');
  };

  const toggleAccordion = (index) => {
    if (expandedDays.includes(index)) {
      setExpandedDays(expandedDays.filter((i) => i !== index));
    } else {
      setExpandedDays([...expandedDays, index]);
    }
  };

  return (
    <div style={{ maxWidth: '550px', margin: '20px auto 40px', padding: '0 15px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      
      <CheckoutSteps step1 step2 step3 />

      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #eee' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>
          {step === 1 ? 'Confirm Delivery Address' : 'Choose Delivery Window'}
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
          {step === 1 ? 'Tell us where to deliver your order.' : 'Select when you\'d like us to deliver.'}
        </p>
      </div>

      <div style={{ background: '#fff', padding: '15px 20px 20px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* --- THE FIX: STRICT 100% HORIZONTAL SLIDING WRAPPER --- */}
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div style={{ display: 'flex', width: '100%', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', transform: step === 1 ? 'translateX(0)' : 'translateX(-100%)', alignItems: 'flex-start' }}>
            
            {/* ========================================= */}
            {/* STEP 1: ADDRESS SELECTION PANE            */}
            {/* ========================================= */}
            <div style={{ flex: '0 0 100%', paddingRight: '2px', boxSizing: 'border-box' }}>
              
              {savedProfileAddress && savedProfileAddress.lat && (
                <div style={{ marginBottom: '15px', padding: '12px', background: useProfileAddress ? '#e6f7ff' : '#f5f5f5', border: `1px solid ${useProfileAddress ? '#91d5ff' : '#ddd'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}>
                  <input 
                    type="checkbox" 
                    id="useProfileCheck"
                    checked={useProfileAddress}
                    onChange={handleUseProfileToggle}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="useProfileCheck" style={{ color: useProfileAddress ? '#096dd9' : '#666', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Use my saved Profile Address
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {!useProfileAddress && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>Search Address</label>
                    
                    {loadError ? (
                      <div style={{ color: 'red', fontSize: '0.85rem', marginBottom: '10px' }}>
                        Error loading map. Please check connection.
                      </div>
                    ) : !isLoaded ? (
                      <input type="text" disabled placeholder="Loading map..." style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', background: '#f5f5f5' }} />
                    ) : (
                      <Autocomplete 
                        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                        onPlaceChanged={handlePlaceChanged}
                        options={{ bounds: searchBounds, strictBounds: true, componentRestrictions: { country: ['us', 'ca'] }, fields: ['address_components', 'geometry'] }} 
                      >
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            if (status === 'success') {
                              setStatus(null);
                              setIsEligible(false);
                              setMessage('');
                              setDeliverySlots([]);
                              setSelectedSlot(null);
                            }
                          }}
                          placeholder="Start typing street address..."
                          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1rem' }}
                        />
                      </Autocomplete>
                    )}
                  </div>
                )}

                {status === 'success' && (
                  <div style={{ color: '#389e0d', fontWeight: 'bold', background: '#f6ffed', padding: '8px 10px', borderRadius: '4px', border: '1px solid #b7eb8f', fontSize: '0.9rem' }}>
                    {message}
                  </div>
                )}
                {status === 'out-of-range' && (
                  <div style={{ color: '#cf1322', fontWeight: 'bold', background: '#fff2f0', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ffccc7', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {message}
                  </div>
                )}
                {status === 'error' && (
                  <div style={{ color: '#d48806', fontWeight: 'bold', background: '#fffbe6', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ffe58f', fontSize: '0.9rem' }}>
                    ⚠️ {message}
                  </div>
                )}

                {status === 'success' && address && (
                  <>
                    {useProfileAddress ? (
                      <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px dashed #ccc' }}>
                        <input type="text" value={`${address}, ${city}, NY ${postalCode}`} disabled style={{ width: '100%', padding: '8px', background: '#eaeaea', border: '1px solid #ccc', borderRadius: '4px', color: '#666', boxSizing: 'border-box' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px', background: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px dashed #ccc' }}>
                        <div style={{ flex: '2' }}>
                          <input type="text" value={address} disabled style={{ width: '100%', padding: '8px', background: '#eaeaea', border: '1px solid #ccc', borderRadius: '4px', color: '#666', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: '1' }}>
                          <input type="text" value={aptNumber} onChange={(e) => setAptNumber(e.target.value)} placeholder="Apt 4B" style={{ width: '100%', padding: '8px', background: '#fff', border: '1px solid #1890ff', borderRadius: '4px', color: '#111', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {status === 'success' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>Delivery Terrain</label>
                    <select 
                      value={terrainType} 
                      onChange={(e) => setTerrainType(e.target.value)}
                      disabled={useProfileAddress} 
                      style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: useProfileAddress ? '#f5f5f5' : 'white', fontSize: '0.95rem' }}
                    >
                      <option value="Land">Land (Standard Street Delivery)</option>
                      <option value="Water">Water (Island / Dock Delivery)</option>
                    </select>
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  disabled={!isEligible}
                  style={{ 
                    width: '100%', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', marginTop: '5px', fontSize: '1.05rem',
                    background: isEligible ? 'black' : '#ccc', color: isEligible ? 'white' : '#666',
                    cursor: isEligible ? 'pointer' : 'not-allowed', transition: 'background 0.3s'
                  }}
                >
                  {isEligible ? 'Confirm Address →' : 'Enter Valid Address to Continue'}
                </button>
              </div>
            </div>

            {/* ========================================= */}
            {/* STEP 2: DELIVERY WINDOW CALENDAR PANE       */}
            {/* ========================================= */}
            <div style={{ flex: '0 0 100%', paddingLeft: '2px', boxSizing: 'border-box' }}>
              
              {/* THE FIX: "Edit Address" is now a clean Pill Button */}
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: '#f5f5f5', border: '1px solid #ddd', color: '#333', 
                  fontWeight: 'bold', cursor: 'pointer', padding: '6px 14px', 
                  borderRadius: '20px', marginBottom: '15px', fontSize: '0.85rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#eaeaea'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
              >
                &larr; Edit Address
              </button>

              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>Select Delivery Window</h3>
              
              {slotsLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
                  Calculating optimal routes...
                </div>
              ) : deliverySlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#cf1322', background: '#fff2f0', borderRadius: '8px', border: '1px solid #ffccc7' }}>
                  No delivery windows available at this time.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* THE FIX: The dynamic accordion logic pushes the bottom buttons up! */}
                  {deliverySlots.map((dayObj, idx) => {
                    const isExpanded = expandedDays.includes(idx);
                    return (
                      <div key={dayObj.date} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                        
                        <div 
                          onClick={() => toggleAccordion(idx)}
                          style={{ background: '#1a1a1a', color: 'white', padding: '14px 15px', fontWeight: 'bold', borderBottom: isExpanded ? '1px solid #ddd' : 'none', fontSize: '1.05rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
                        >
                          <span>📅 {dayObj.dayName} ({dayObj.date})</span>
                          <span style={{ fontSize: '0.9rem', color: '#fff', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                            ▼
                          </span>
                        </div>
                        
                        {isExpanded && (
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
                                    padding: '12px 15px', textAlign: 'left', cursor: isAvailable ? 'pointer' : 'not-allowed',
                                    border: 'none', borderBottom: '1px solid #eee',
                                    background: isSelected ? '#fffbe6' : isAvailable ? 'white' : '#fafafa',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s',
                                    width: '100%', boxSizing: 'border-box'
                                  }}
                                >
                                  <div>
                                    <span style={{ display: 'block', fontWeight: 'bold', color: isAvailable ? (isSelected ? '#d48806' : '#111') : '#999', fontSize: '0.95rem', marginBottom: '2px', textDecoration: !isAvailable ? 'line-through' : 'none' }}>
                                      {slot.time}
                                    </span>
                                    {!isAvailable && (
                                      <span style={{ fontSize: '0.75rem', color: '#cf1322', fontWeight: 'bold' }}>
                                        {slot.reason || slot.status}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && <span style={{ color: '#d48806', fontWeight: 'bold', fontSize: '1.1rem' }}>✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!useProfileAddress && status === 'success' && (
                <div style={{ padding: '10px', background: '#fafafa', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                  <input type="checkbox" id="saveToProfileCheck" checked={saveToProfile} onChange={(e) => setSaveToProfile(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="saveToProfileCheck" style={{ color: '#333', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                    Save address to my Profile
                  </label>
                </div>
              )}

              <button 
                type="button" 
                onClick={() => setShowConfirmModal(true)}
                disabled={!selectedSlot}
                style={{ 
                  width: '100%', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', marginTop: '10px', fontSize: '1.05rem',
                  background: selectedSlot ? 'black' : '#ccc', color: selectedSlot ? 'white' : '#666',
                  cursor: selectedSlot ? 'pointer' : 'not-allowed', transition: 'background 0.3s'
                }}
              >
                {selectedSlot ? 'Confirm Delivery Window' : 'Select a Delivery Window ↑'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* --- FINAL COMMITMENT MODAL --- */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginTop: 0, color: '#111', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Delivery Commitment</h3>
            
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#666' }}>Scheduled For:</p>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', color: '#d48806' }}>
                {new Date(selectedSlot?.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at {selectedSlot?.time}
              </p>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5', marginBottom: '25px' }}>
              By confirming, you agree that you will be physically present at the delivery address during this entire window with a valid <strong>21+ ID</strong>. 
              If you are unavailable, your order will be returned to the store and a restocking fee may apply.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={finalizeShipping} 
                style={{ width: '100%', padding: '12px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#333'}
                onMouseOut={(e) => e.currentTarget.style.background = 'black'}
              >
                I Understand, Proceed to Payment
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                style={{ width: '100%', padding: '10px', background: 'white', color: '#333', border: '1px solid #ccc', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel & Go Back
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShippingScreen;