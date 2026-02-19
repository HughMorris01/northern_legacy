import { Link } from 'react-router-dom';

const MerchScreen = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '50px 30px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👕 Official Merch</h1>
        <h2 style={{ color: '#1890ff', margin: '0 0 20px 0' }}>Coming Soon!</h2>
        
        <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.6', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          We are currently finalizing our merchandise portal. Soon you will be able to grab Northern Legacy hoodies, hats, and accessories directly from here. 
          <br /><br />
          <strong style={{ color: '#d48806', background: '#fffbe6', padding: '5px 10px', borderRadius: '4px' }}>*Development Mode Active*</strong>
        </p>

        <Link 
          to="/" 
          style={{ 
            display: 'inline-block', padding: '12px 25px', background: 'black', color: 'white', 
            textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#333'}
          onMouseOut={(e) => e.currentTarget.style.background = 'black'}
        >
          &larr; Back to Menu
        </Link>
      </div>
    </div>
  );
};

export default MerchScreen;