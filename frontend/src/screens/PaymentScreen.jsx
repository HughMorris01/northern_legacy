import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CheckoutSteps from '../components/CheckoutSteps';
import axios from '../axios';
import { toast } from 'react-toastify';

const PaymentScreen = () => {
  const navigate = useNavigate();

  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const savePaymentMethod = useCartStore((state) => state.savePaymentMethod);
  const currentPaymentMethod = useCartStore((state) => state.paymentMethod);

  const [paymentMethod, setPaymentMethod] = useState(currentPaymentMethod || 'Aeropay (ACH)');
  
  // Saved Payment State
  const [savedBank, setSavedBank] = useState('');
  const [useSavedPayment, setUseSavedPayment] = useState(false);

  // Modal State Machine
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('select-bank'); 
  const [selectedBank, setSelectedBank] = useState('');
  const [fakeUsername, setFakeUsername] = useState('');
  const [fakePassword, setFakePassword] = useState('');
  const [fakeCard, setFakeCard] = useState('');

  const isPickup = shippingAddress?.address === 'In-Store Pickup';

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    } else {
      const fetchProfile = async () => {
        try {
          const { data } = await axios.get('/api/users/profile');
          if (data.linkedBank) {
            setSavedBank(data.linkedBank);
            setUseSavedPayment(true);
            if (data.linkedBank.includes('Card')) setPaymentMethod('Debit Card');
            else setPaymentMethod('Aeropay (ACH)');
          }
        } catch {
          console.warn('No linked bank found on profile.');
        }
      };
      fetchProfile();
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (paymentMethod === 'Pay In-Store' || useSavedPayment) {
      savePaymentMethod(paymentMethod);
      navigate('/placeorder');
    } else {
      setModalStep(paymentMethod === 'Debit Card' ? 'enter-card' : 'select-bank');
      setFakeUsername('');
      setFakePassword('');
      setFakeCard('');
      setShowModal(true);
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
        
        // Save the newly linked method to their profile permanently!
        const linkedData = authType === 'ACH' 
          ? selectedBank 
          : `Debit Card ending in ${fakeCard.slice(-4)}`;

        try {
          await axios.put('/api/users/profile', { linkedBank: linkedData });
          toast.success(`${linkedData} successfully securely linked!`);
        } catch {
          console.warn('Failed to save linked bank to profile');
        }

        savePaymentMethod(paymentMethod);
        navigate('/placeorder'); 
      }, 1500);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <CheckoutSteps step1 step2 step3 step4 /> 
      
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Payment Method</h2>
        
        {savedBank && (
          <div style={{ marginBottom: '20px', padding: '15px', background: useSavedPayment ? '#e6f7ff' : '#f5f5f5', border: `1px solid ${useSavedPayment ? '#91d5ff' : '#ddd'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s' }}>
            <input 
              type="checkbox" 
              id="useSavedPaymentCheck"
              checked={useSavedPayment}
              onChange={(e) => {
                setUseSavedPayment(e.target.checked);
                if (e.target.checked) {
                  setPaymentMethod(savedBank.includes('Card') ? 'Debit Card' : 'Aeropay (ACH)');
                }
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="useSavedPaymentCheck" style={{ color: useSavedPayment ? '#096dd9' : '#666', fontWeight: 'bold', cursor: 'pointer' }}>
              Use my linked payment method ({savedBank})
            </label>
          </div>
        )}

        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ padding: '20px', background: paymentMethod === 'Aeropay (ACH)' ? '#fafafa' : 'white', border: `2px solid ${paymentMethod === 'Aeropay (ACH)' ? 'black' : '#eee'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontSize: '1.1rem' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="Aeropay (ACH)" 
                checked={paymentMethod === 'Aeropay (ACH)'} 
                onChange={(e) => { setPaymentMethod(e.target.value); setUseSavedPayment(false); }} 
                style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
              />
              <strong>Aeropay (ACH / Bank Link)</strong>
            </label>
            <p style={{ marginLeft: '32px', color: '#666', fontSize: '0.9rem', marginTop: '5px', marginBottom: 0 }}>
              Secure, tokenized bank transfer with no added processing fees.
            </p>
          </div>

          <div style={{ padding: '20px', background: paymentMethod === 'Debit Card' ? '#fafafa' : 'white', border: `2px solid ${paymentMethod === 'Debit Card' ? 'black' : '#eee'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontSize: '1.1rem' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="Debit Card" 
                checked={paymentMethod === 'Debit Card'} 
                onChange={(e) => { setPaymentMethod(e.target.value); setUseSavedPayment(false); }} 
                style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
              />
              <strong>Debit Card (PIN Required)</strong>
            </label>
            <p style={{ marginLeft: '32px', color: '#666', fontSize: '0.9rem', marginTop: '5px', marginBottom: 0 }}>
              Subject to a standard $3.00 cashless ATM processing fee.
            </p>
          </div>

          {isPickup && (
            <div style={{ padding: '20px', background: paymentMethod === 'Pay In-Store' ? '#fafafa' : 'white', border: `2px solid ${paymentMethod === 'Pay In-Store' ? 'black' : '#eee'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontSize: '1.1rem' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Pay In-Store" 
                  checked={paymentMethod === 'Pay In-Store'} 
                  onChange={(e) => { setPaymentMethod(e.target.value); setUseSavedPayment(false); }} 
                  style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                />
                <strong>Pay In-Store (Cash/Terminal)</strong>
              </label>
              <p style={{ marginLeft: '32px', color: '#666', fontSize: '0.9rem', marginTop: '5px', marginBottom: 0 }}>
                Available for In-Store Pickup reservations only.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '10px', transition: 'background 0.3s' }}
          >
            {useSavedPayment || paymentMethod === 'Pay In-Store' ? 'Continue to Final Review' : `Authorize ${paymentMethod}`}
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

export default PaymentScreen;