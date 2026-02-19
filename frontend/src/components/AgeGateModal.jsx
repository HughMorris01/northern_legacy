import { useState } from 'react';

const AgeGateModal = () => {
  // THE FIX: "Lazy Initialization". React checks localStorage immediately on mount, 
  // bypassing the need for a useEffect and eliminating the double-render!
  const [isVisible, setIsVisible] = useState(() => {
    return !localStorage.getItem('ageVerified');
  });

  const handleConfirm = () => {
    // Save their confirmation to the browser so they aren't asked again
    localStorage.setItem('ageVerified', 'true');
    setIsVisible(false);
  };

  const handleDeny = () => {
    // Kick them off the site if they are underage
    window.location.href = 'https://www.google.com'; 
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', 
      backdropFilter: 'blur(10px)', 
      WebkitBackdropFilter: 'blur(10px)', 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999 
    }}>
      <div style={{
        background: 'white',
        padding: '40px 30px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        fontFamily: 'sans-serif'
      }}>
        <h1 style={{ margin: '0 0 15px 0', fontSize: '1.8rem', color: '#111' }}>Are you 21 or older?</h1>
        
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '1rem', lineHeight: '1.5' }}>
          You must be at least 21 years old to enter this site. By clicking "Yes", you verify that you are of legal age to view and purchase cannabis products in New York State.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={handleConfirm}
            style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#333'}
            onMouseOut={(e) => e.currentTarget.style.background = 'black'}
          >
            Yes, I am 21 or older
          </button>
          
          <button 
            onClick={handleDeny}
            style={{ width: '100%', padding: '15px', background: '#f5f5f5', color: '#333', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = '#eaeaea'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f5f5f5'}
          >
            No, I am under 21
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeGateModal;