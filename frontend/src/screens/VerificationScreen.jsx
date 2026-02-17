import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import PersonaReact from 'persona-react';

const VerificationScreen = () => {
  const navigate = useNavigate();
  const userInfo = useAuthStore((state) => state.userInfo);
  
  const [status, setStatus] = useState('pending'); // pending, success, canceled, error

  useEffect(() => {
    // Security: Kick them out if they aren't logged in
    if (!userInfo) {
      navigate('/login');
    } 
    // UX: If they are already verified, redirect them to their profile
    else if (userInfo.isVerified) {
      navigate('/profile');
    }
  }, [userInfo, navigate]);

  const queryParams = new URLSearchParams(window.location.search);
  const redirect = queryParams.get('redirect') || '/profile';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '10px' }}>Verify Your Identity</h1>
      <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
        To comply with state regulations, you must verify your age using a valid government-issued ID.
      </p>

      {status === 'pending' && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#f9f9f9', minHeight: '800px', display: 'flex', justifyContent: 'center' }}>
          
          {/* THE EMBEDDED PERSONA SDK */}
          <PersonaReact
            templateId="itmpl_JFujKwyQDksMLZGvVdk2vSn7k984" // Persona Sandbox Dashboard Template ID
            environment="sandbox" // MUST remain 'sandbox' during development!
            referenceId={userInfo?._id} // CRITICAL: This ties the physical ID to the MongoDB user
            onReady={() => console.log('Persona UI loaded')}
            onComplete={({ inquiryId }) => {
              setStatus('success');
              
              // Force the frontend state to update instantly
              useAuthStore.getState().setCredentials({ 
                ...userInfo, 
                isVerified: true,
                idExpirationDate: 'Sandbox Mode',
                verificationRefNumber: inquiryId // Injects the ID immediately for the UI
              });
            }}
            onCancel={() => { // <-- Removed inquiryId and sessionToken entirely
              console.log('User canceled the flow');
              setStatus('canceled');
            }}
            onError={(error) => {
              console.error('Persona Error:', error.message);
              setStatus('error');
            }}
          />
          
        </div>
      )}

      {/* --- FEEDBACK STATES --- */}
      {status === 'success' && (
        <div style={{ padding: '40px', background: '#e6ffed', border: '2px solid #34d058', borderRadius: '8px' }}>
          <h2 style={{ color: 'green', marginTop: 0 }}>Verification Submitted!</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
            Your ID has been scanned securely. Our system is updating your profile.
          </p>
          <button 
            onClick={() => navigate('/profile')}
            style={{ padding: '12px 24px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
          >
          {redirect === '/profile' ? 'Return to Profile' : 'Continue to Checkout'}
          </button>
        </div>
      )}

      {status === 'canceled' && (
        <div style={{ padding: '40px', background: '#fffbe6', border: '2px solid #ffe58f', borderRadius: '8px' }}>
          <h2 style={{ color: '#d48806', marginTop: 0 }}>Verification Canceled</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
            You closed the verification window before finishing. You must complete this step to place orders.
          </p>
          <button 
            onClick={() => setStatus('pending')}
            style={{ padding: '12px 24px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
          >
            Try Again
          </button>
        </div>
      )}

      {status === 'error' && (
        <div style={{ padding: '40px', background: '#fff1f0', border: '2px solid #ffa39e', borderRadius: '8px' }}>
          <h2 style={{ color: '#cf1322', marginTop: 0 }}>System Error</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
            There was a technical issue loading the camera. Please refresh the page and try again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '12px 24px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
          >
            Refresh Page
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationScreen;