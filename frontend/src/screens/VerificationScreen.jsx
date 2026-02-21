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
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #eee' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a' }}>Complete Identity Verification</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Verify your identity to unlock age-gated purchases.</p>
      </div>
      
      {status === 'pending' && (
        <>
          {/* THE FIX: Highly visible tester instructions to contextualize the scary pink box */}
          <div style={{ background: '#e6f7ff', border: '1px solid #91d5ff', padding: '20px', borderRadius: '8px', marginBottom: '30px', textAlign: 'left', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#096dd9', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🧪 Beta Tester Instructions
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#333', lineHeight: '1.6', fontSize: '1.05rem' }}>
              <li><strong>Ignore the Pink Warning:</strong> The system will display a pink "Sandbox" security warning. This is normal for test mode. Simply click the "X" to close it.</li>
              <li><strong>No Real ID Needed:</strong> Just aim your camera at your hand or a random object for a few seconds.</li>
              <li><strong>Taking the Photo:</strong> Tap the screen and a capture button will appear. (Note: the sandbox slider might overlap the button, just click around it).</li>
              <li><strong>Face Scan:</strong> After the ID step, it will ask for 3 quick photos of your face to complete the test.</li>
            </ul>
          </div>

          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#f9f9f9', minHeight: '800px', display: 'flex', justifyContent: 'center' }}>
            <PersonaReact
              templateId="itmpl_JFujKwyQDksMLZGvVdk2vSn7k984" 
              environment="sandbox" 
              referenceId={userInfo?._id} 
              onReady={() => console.log('Persona UI loaded')}
              onComplete={({ inquiryId }) => {
                setStatus('success');
                
                useAuthStore.getState().setCredentials({ 
                  ...userInfo, 
                  isVerified: true,
                  idExpirationDate: 'Sandbox Mode',
                  verificationRefNumber: inquiryId 
                });
              }}
              onCancel={() => { 
                console.log('User canceled the flow');
                setStatus('canceled');
              }}
              onError={(error) => {
                console.error('Persona Error:', error.message);
                setStatus('error');
              }}
            />
          </div>
        </>
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