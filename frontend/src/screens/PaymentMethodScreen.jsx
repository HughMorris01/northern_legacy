import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CheckoutSteps from '../components/CheckoutSteps';
import axios from '../axios';
import { toast } from 'react-toastify';

const PaymentMethodScreen = () => {
  const navigate = useNavigate();

  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const savePaymentMethod = useCartStore((state) => state.savePaymentMethod);
  const currentPaymentMethod = useCartStore((state) => state.paymentMethod);

  const [paymentMethod, setPaymentMethod] = useState(currentPaymentMethod || 'Aeropay (ACH)');
  
  // Independent Saved States
  const [linkedAch, setLinkedAch] = useState('');
  const [linkedDebit, setLinkedDebit] = useState('');

  // Sub-selection states for overriding saved methods
  const [useNewAch, setUseNewAch] = useState(false);
  const [useNewDebit, setUseNewDebit] = useState(false);

  // Modal State Machine
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('select-bank'); 
  const [selectedBank, setSelectedBank] = useState('');
  const [fakeUsername, setFakeUsername] = useState('');
  const [fakePassword, setFakePassword] = useState('');
  const [fakeCard, setFakeCard] = useState('');
  
  // Controls whether the new modal data gets pushed to the user's DB profile
  const [saveMethodToProfile, setSaveMethodToProfile] = useState(true);

  const isPickup = shippingAddress?.address === 'In-Store Pickup';

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    } else {
      const fetchProfile = async () => {
        try {
          const { data } = await axios.get('/api/users/profile');
          setLinkedAch(data.linkedAch || '');
          setLinkedDebit(data.linkedDebit || '');
        } catch {
          console.warn('No linked methods found on profile.');
        }
      };
      fetchProfile();
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (paymentMethod === 'Pay In-Store') {
      savePaymentMethod(paymentMethod);
      navigate('/placeorder');
    } else if (paymentMethod === 'Aeropay (ACH)') {
      if (linkedAch && !useNewAch) {
        savePaymentMethod(paymentMethod);
        navigate('/placeorder');
      } else {
        setModalStep('select-bank');
        setFakeUsername('');
        setFakePassword('');
        setSaveMethodToProfile(true); // Default to true when opening
        setShowModal(true);
      }
    } else if (paymentMethod === 'Debit Card') {
      if (linkedDebit && !useNewDebit) {
        savePaymentMethod(paymentMethod);
        navigate('/placeorder');
      } else {
        setModalStep('enter-card');
        setFakeCard('');
        setSaveMethodToProfile(true); // Default to true when opening
        setShowModal(true);
      }
    }
  };

  const handleBankSelect = (bankName) => {
    setSelectedBank(bankName);
    setModalStep('login');
  };

  const handleAuthorization = (e, authType) => {
    e.preventDefault();
    if (modalStep === 'processing' || modalStep === 'success') return; 
    
    setModalStep('processing');
    
    setTimeout(() => {
      setModalStep('success');
      setTimeout(async () => {
        setShowModal(false);
        
        const linkedData = authType === 'ACH' 
          ? selectedBank 
          : `Debit Card ending in ${fakeCard.slice(-4)}`;

        // Only push to backend if the user left the sync checkbox checked!
        if (saveMethodToProfile) {
          try {
            const payload = authType === 'ACH' ? { linkedAch: linkedData } : { linkedDebit: linkedData };
            await axios.put('/api/users/profile', payload);
            toast.success(`${linkedData} successfully saved to profile!`);
          } catch {
            console.warn('Failed to save linked method to profile');
          }
        } else {
          toast.success(`${linkedData} authorized for this order!`);
        }

        savePaymentMethod(paymentMethod);
        navigate('/placeorder'); 
      }, 1500);
    }, 2000);
  };

  const getButtonText = () => {
    if (paymentMethod === 'Pay In-Store') return 'Continue to Final Review';
    if (paymentMethod === 'Aeropay (ACH)') return (linkedAch && !useNewAch) ? `Pay with ${linkedAch}` : 'Link New Bank Account';
    if (paymentMethod === 'Debit Card') return (linkedDebit && !useNewDebit) ? `Pay with Debit Card` : 'Link New Debit Card';
    return 'Continue';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto 40px', padding: '0 15px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <CheckoutSteps step1 step2 step3 step4 /> 
      
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #eee' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>Choose Payment Method</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Select how you'd like to pay for your order.</p>
      </div>
      
      <div style={{ background: '#fff', padding: '15px 20px 20px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* ACH BLOCK */}
          <div style={{ padding: '15px', background: paymentMethod === 'Aeropay (ACH)' ? '#fafafa' : 'white', border: `2px solid ${paymentMethod === 'Aeropay (ACH)' ? 'black' : '#eee'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '1.05rem' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="Aeropay (ACH)" 
                checked={paymentMethod === 'Aeropay (ACH)'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                style={{ transform: 'scale(1.4)', cursor: 'pointer', margin: 0 }}
              />
              <strong>Aeropay (ACH / Bank Link)</strong>
            </label>
            <p style={{ marginLeft: '30px', color: '#666', fontSize: '0.85rem', marginTop: '2px', marginBottom: '8px' }}>
              Secure, tokenized bank transfer with no added processing fees.
            </p>
            
            {linkedAch && (
              <div style={{ marginLeft: '30px', padding: '10px', background: '#f5f5f5', borderRadius: '6px', border: '1px solid #ddd' }}>
                <p style={{ color: '#389e0d', fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>✓ Saved Account: {linkedAch}</p>
                
                {paymentMethod === 'Aeropay (ACH)' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                      <input type="radio" checked={!useNewAch} onChange={() => setUseNewAch(false)} style={{ margin: 0 }} />
                      Use {linkedAch}
                    </label>
                    <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                      <input type="radio" checked={useNewAch} onChange={() => setUseNewAch(true)} style={{ margin: 0 }} />
                      Link a different bank account
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DEBIT BLOCK */}
          <div style={{ padding: '15px', background: paymentMethod === 'Debit Card' ? '#fafafa' : 'white', border: `2px solid ${paymentMethod === 'Debit Card' ? 'black' : '#eee'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '1.05rem' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="Debit Card" 
                checked={paymentMethod === 'Debit Card'} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                style={{ transform: 'scale(1.4)', cursor: 'pointer', margin: 0 }}
              />
              <strong>Debit Card (PIN Required)</strong>
            </label>
            <p style={{ marginLeft: '30px', color: '#666', fontSize: '0.85rem', marginTop: '2px', marginBottom: '8px' }}>
              Subject to a standard $3.00 cashless ATM processing fee.
            </p>

            {linkedDebit && (
              <div style={{ marginLeft: '30px', padding: '10px', background: '#f5f5f5', borderRadius: '6px', border: '1px solid #ddd' }}>
                <p style={{ color: '#389e0d', fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>✓ Saved Card: {linkedDebit}</p>
                
                {paymentMethod === 'Debit Card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                      <input type="radio" checked={!useNewDebit} onChange={() => setUseNewDebit(false)} style={{ margin: 0 }} />
                      Use {linkedDebit}
                    </label>
                    <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                      <input type="radio" checked={useNewDebit} onChange={() => setUseNewDebit(true)} style={{ margin: 0 }} />
                      Link a different debit card
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* IN-STORE BLOCK */}
          {isPickup && (
            <div style={{ padding: '15px', background: paymentMethod === 'Pay In-Store' ? '#fafafa' : 'white', border: `2px solid ${paymentMethod === 'Pay In-Store' ? 'black' : '#eee'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '1.05rem' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Pay In-Store" 
                  checked={paymentMethod === 'Pay In-Store'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  style={{ transform: 'scale(1.4)', cursor: 'pointer', margin: 0 }}
                />
                <strong>Pay In-Store (Cash/Terminal)</strong>
              </label>
              <p style={{ marginLeft: '30px', color: '#666', fontSize: '0.85rem', marginTop: '2px', marginBottom: 0 }}>
                Available for In-Store Pickup reservations only.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 'bold', marginTop: '5px', transition: 'background 0.3s' }}
          >
            {getButtonText()}
          </button>
        </form>
      </div>

      {/* --- MOCK AUTHORIZATION MODAL --- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', position: 'relative' }}>
            
            {modalStep !== 'processing' && modalStep !== 'success' && (
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>×</button>
            )}

            {modalStep === 'select-bank' && (
              <div>
                <h3 style={{ textAlign: 'center', marginBottom: '5px', color: '#1890ff' }}>Secure Bank Link</h3>
                <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>Select your institution to pay securely via Aeropay.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Chase', 'Bank of America', 'Wells Fargo', 'Capital One'].map((bank) => (
                    <button key={bank} onClick={() => handleBankSelect(bank)} style={{ padding: '15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}>
                      🏦 {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {modalStep === 'login' && (
              <div>
                <button onClick={() => setModalStep('select-bank')} style={{ background: 'none', border: 'none', color: '#1890ff', cursor: 'pointer', marginBottom: '15px', padding: 0 }}>← Back</button>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Login to {selectedBank}</h3>
                <form onSubmit={(e) => handleAuthorization(e, 'ACH')} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input type="text" placeholder="Online ID" value={fakeUsername} onChange={(e) => setFakeUsername(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                  <input type="password" placeholder="Passcode" value={fakePassword} onChange={(e) => setFakePassword(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                  <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', margin: 0 }}>By logging in, you agree to the secure transfer of funds.</p>
                  
                  <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#333', cursor: 'pointer', margin: 0 }}>
                      <input type="checkbox" checked={saveMethodToProfile} onChange={(e) => setSaveMethodToProfile(e.target.checked)} />
                      Save this bank account to my profile for future use
                    </label>
                  </div>

                  <button type="submit" disabled={modalStep === 'processing' || modalStep === 'success'} style={{ padding: '15px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    Agree & Link Account
                  </button>
                </form>
              </div>
            )}

            {modalStep === 'enter-card' && (
              <div>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Secure Debit Entry</h3>
                <form onSubmit={(e) => handleAuthorization(e, 'DEBIT')} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input type="text" placeholder="16-Digit Card Number" maxLength="16" value={fakeCard} onChange={(e) => setFakeCard(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <input type="text" placeholder="MM/YY" maxLength="5" style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }} required />
                     <input type="text" placeholder="CVC" maxLength="3" style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px', width: '80px' }} required />
                  </div>
                  <input type="text" placeholder="Billing Zip Code" maxLength="5" style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                  <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', margin: 0 }}>A standard $3.00 processing fee will be applied to this order.</p>
                  
                  <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#333', cursor: 'pointer', margin: 0 }}>
                      <input type="checkbox" checked={saveMethodToProfile} onChange={(e) => setSaveMethodToProfile(e.target.checked)} />
                      Save this debit card to my profile for future use
                    </label>
                  </div>

                  <button type="submit" disabled={modalStep === 'processing' || modalStep === 'success'} style={{ padding: '15px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    Authorize Card
                  </button>
                </form>
              </div>
            )}

            {modalStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #1890ff', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                <h3>Authorizing Method...</h3>
                <p style={{ color: '#666' }}>Securely communicating with bank network.</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {modalStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ background: '#52c41a', color: 'white', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>✓</div>
                <h3 style={{ color: '#52c41a' }}>Method Linked!</h3>
                <p style={{ color: '#666' }}>Redirecting to final review...</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentMethodScreen;