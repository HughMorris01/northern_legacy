import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import axios from '../axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const EditPaymentMethodScreen = () => {
  const [linkedAch, setLinkedAch] = useState('');
  const [linkedDebit, setLinkedDebit] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State Machines
  const [showModal, setShowModal] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState(''); // Knows WHICH method to delete
  
  const [modalStep, setModalStep] = useState('select-bank'); 
  const [selectedBank, setSelectedBank] = useState('');
  const [fakeUsername, setFakeUsername] = useState('');
  const [fakePassword, setFakePassword] = useState('');
  const [fakeCard, setFakeCard] = useState(''); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        setLinkedAch(data.linkedAch || '');
        setLinkedDebit(data.linkedDebit || '');
        setLoading(false);
      } catch {
        toast.error('Failed to load payment profile.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const savePaymentToProfile = async (type, value) => {
    try {
      const payload = type === 'ACH' ? { linkedAch: value } : { linkedDebit: value };
      await axios.put('/api/users/profile', payload);
      
      if (type === 'ACH') setLinkedAch(value);
      if (type === 'DEBIT') setLinkedDebit(value);

      if (value) toast.success(`Payment method successfully linked!`);
      else toast.info('Payment method unlinked.');
    } catch {
      toast.error('Failed to update payment details.');
    }
  };

  const unlinkHandler = (type) => {
    setUnlinkTarget(type);
    setShowUnlinkModal(true);
  };

  const confirmUnlink = () => {
    savePaymentToProfile(unlinkTarget, '');
    setShowUnlinkModal(false);
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
      setTimeout(() => {
        const linkedData = authType === 'ACH' 
          ? selectedBank 
          : `Debit Card ending in ${fakeCard.slice(-4)}`;

        savePaymentToProfile(authType, linkedData);
        setShowModal(false);
        setModalStep('select-bank');
        setFakeUsername('');
        setFakePassword('');
        setFakeCard('');
      }, 1500);
    }, 2000);
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 15px', fontFamily: 'sans-serif' }}>
      
      {/* THE FIX: Refined into a styled "Pill" button */}
      <Link 
        to="/profile" 
        style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          marginBottom: '20px', textDecoration: 'none', color: '#333', 
          fontWeight: 'bold', fontSize: '0.85rem', padding: '8px 16px',
          background: '#fff', border: '1px solid #ddd', borderRadius: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = '#ccc'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#ddd'; }}
      >
        &larr; Back to Profile
      </Link>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <h1 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          Manage Payment Methods
        </h1>

        {/* THE FIX: Comforting, professional messaging + technical jargon */}
        <div style={{ marginBottom: '25px', padding: '20px', background: '#f5f8fa', border: '1px solid #e1e8ed', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#111', fontSize: '1.1rem' }}>A Note on Payments</h3>
          <p style={{ margin: '0 0 15px 0', color: '#444', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Due to current federal banking regulations surrounding the cannabis industry, we are temporarily unable to process traditional credit card transactions. We understand this can be an inconvenience, but we want to assure you that your security and privacy remain our absolute highest priority. 
          </p>
          <p style={{ margin: '0 0 15px 0', color: '#444', lineHeight: '1.6', fontSize: '0.95rem' }}>
            To provide you with a safe and seamless checkout experience, we have partnered with highly-regulated, industry-leading financial networks to offer trusted cashless alternatives.
          </p>
          <div style={{ padding: '12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '5px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#096dd9', lineHeight: '1.5' }}>
              🔒 <strong>Bank-Level Security:</strong> All financial data is tokenized and vaulted using SOC2-compliant AES-256 encryption. Raw account or card numbers are never stored on Northern Legacy servers.
            </p>
          </div>
        </div>
        
        {/* ACH SLOT */}
        <div style={{ padding: '20px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#111', fontSize: '1.1rem' }}>🏦 Aeropay Digital ACH</h3>
            {linkedAch ? (
              <p style={{ margin: 0, color: '#389e0d', fontWeight: 'bold' }}>Active Link: {linkedAch}</p>
            ) : (
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>No active account linked.</p>
            )}
          </div>
          {linkedAch ? (
            <button onClick={() => unlinkHandler('ACH')} style={{ padding: '10px 20px', background: 'white', color: '#cf1322', border: '1px solid #ffa39e', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#fff2f0'; }}>
              Unlink
            </button>
          ) : (
            <button onClick={() => { setModalStep('select-bank'); setShowModal(true); }} style={{ padding: '10px 20px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#096dd9'; }}>
              Link Bank
            </button>
          )}
        </div>

        {/* DEBIT SLOT */}
        <div style={{ padding: '20px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#111', fontSize: '1.1rem' }}>💳 Secure Debit Card</h3>
            {linkedDebit ? (
              <p style={{ margin: 0, color: '#389e0d', fontWeight: 'bold' }}>Active Link: {linkedDebit}</p>
            ) : (
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>No active card linked.</p>
            )}
          </div>
          {linkedDebit ? (
            <button onClick={() => unlinkHandler('DEBIT')} style={{ padding: '10px 20px', background: 'white', color: '#cf1322', border: '1px solid #ffa39e', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#fff2f0'; }}>
              Unlink
            </button>
          ) : (
            <button onClick={() => { setModalStep('enter-card'); setFakeCard(''); setShowModal(true); }} style={{ padding: '10px 20px', background: '#111', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#333'; }}>
              Link Card
            </button>
          )}
        </div>

      </div>

      {/* CUSTOM UNLINK CONFIRMATION MODAL */}
      {showUnlinkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginTop: 0, color: '#cf1322', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Unlink Payment Method?</h3>
            <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5', marginBottom: '25px' }}>
              Are you sure you want to remove <strong>{unlinkTarget === 'ACH' ? linkedAch : linkedDebit}</strong>? You will need to re-link a method to use it at checkout.
            </p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setShowUnlinkModal(false)} 
                style={{ flex: 1, padding: '12px', background: 'white', color: '#333', border: '1px solid #ccc', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmUnlink} 
                style={{ flex: 1, padding: '12px', background: '#cf1322', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Yes, Unlink
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOR ACH AND DEBIT */}
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
                  
                  <button type="submit" disabled={modalStep === 'processing' || modalStep === 'success'} style={{ padding: '15px', background: (modalStep === 'processing' || modalStep === 'success') ? '#ccc' : '#1890ff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', cursor: (modalStep === 'processing' || modalStep === 'success') ? 'not-allowed' : 'pointer' }}>
                    {modalStep === 'processing' || modalStep === 'success' ? 'Linking Account...' : 'Agree & Link Account'}
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
                  
                  <button type="submit" disabled={modalStep === 'processing' || modalStep === 'success'} style={{ padding: '15px', background: (modalStep === 'processing' || modalStep === 'success') ? '#ccc' : '#111', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', cursor: (modalStep === 'processing' || modalStep === 'success') ? 'not-allowed' : 'pointer' }}>
                    Authorize Card
                  </button>
                </form>
              </div>
            )}

            {modalStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #1890ff', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                <h3>Authorizing Method...</h3>
                <p style={{ color: '#666' }}>Securely communicating with network.</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {modalStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ background: '#52c41a', color: 'white', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>✓</div>
                <h3 style={{ color: '#52c41a' }}>Method Linked!</h3>
                <p style={{ color: '#666' }}>Returning to dashboard...</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default EditPaymentMethodScreen;