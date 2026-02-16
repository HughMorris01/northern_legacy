import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  // Developer Note: Inline styles used for rapid prototyping
  const activeStyle = { 
    padding: '10px 15px', 
    fontWeight: 'bold', 
    color: 'black', 
    textDecoration: 'none',
    borderBottom: '3px solid green'
  };
  
  const disabledStyle = { 
    padding: '10px 15px', 
    fontWeight: 'bold', 
    color: '#ccc', 
    textDecoration: 'none',
    cursor: 'not-allowed'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
      
      {step1 ? (
        <Link to="/login" style={activeStyle}>Sign In</Link>
      ) : (
        <span style={disabledStyle}>Sign In</span>
      )}

      <span style={{ padding: '10px 0', color: '#ccc' }}>&rarr;</span>

      {step2 ? (
        <Link to="/shipping" style={activeStyle}>Shipping</Link>
      ) : (
        <span style={disabledStyle}>Shipping</span>
      )}

      <span style={{ padding: '10px 0', color: '#ccc' }}>&rarr;</span>

      {step3 ? (
        <Link to="/payment" style={activeStyle}>Payment</Link>
      ) : (
        <span style={disabledStyle}>Payment</span>
      )}

      <span style={{ padding: '10px 0', color: '#ccc' }}>&rarr;</span>

      {step4 ? (
        <Link to="/placeorder" style={activeStyle}>Place Order</Link>
      ) : (
        <span style={disabledStyle}>Place Order</span>
      )}

    </div>
  );
};

export default CheckoutSteps;