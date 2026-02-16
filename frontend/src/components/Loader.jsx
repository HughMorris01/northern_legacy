const Loader = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', textAlign: 'center', fontFamily: 'sans-serif' }}>
      
      
      <div style={{ fontSize: '5rem', animation: 'pulse 1.5s infinite ease-in-out' }}>
        🔗
      </div>
      
      <h2 style={{ marginTop: '20px', color: '#333' }}>Waking up the Server...</h2>
      <p style={{ color: 'gray', maxWidth: '400px', marginTop: '10px', lineHeight: '1.5' }}>
        Because this is a development environment, the backend server goes to sleep to save resources. 
        <strong> It may take up to 30 seconds to boot up.</strong> Thank you for your patience!
      </p>

      {/* Inline CSS animation for the pulse effect */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default Loader;