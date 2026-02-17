import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CheckoutSteps from '../components/CheckoutSteps';

const PaymentScreen = () => {
  const navigate = useNavigate();

  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const savePaymentMethod = useCartStore((state) => state.savePaymentMethod);
  const currentPaymentMethod = useCartStore((state) => state.paymentMethod);

  const [paymentMethod, setPaymentMethod] = useState(currentPaymentMethod || 'Aeropay (ACH)');

  // Security Check: If they bypassed the shipping screen, kick them back
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    savePaymentMethod(paymentMethod);
    // Next stop: the final review order page
    navigate('/placeorder');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <CheckoutSteps step1 step2 step3 step4 /> 
      
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Payment Method</h1>
      
      <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontSize: '1.1rem' }}>
            <input 
              type="radio" 
              name="paymentMethod" 
              value="Aeropay (ACH)" 
              checked={paymentMethod === 'Aeropay (ACH)'} 
              onChange={(e) => setPaymentMethod(e.target.value)} 
              style={{ transform: 'scale(1.5)' }}
            />
            <strong>Aeropay (ACH / Bank Link)</strong>
          </label>
          <p style={{ marginLeft: '32px', color: 'gray', fontSize: '0.9rem', marginTop: '5px' }}>
            Mandatory for all Maritime and Land deliveries. Secure, tokenized bank transfer.
          </p>
        </div>

        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', fontSize: '1.1rem' }}>
            <input 
              type="radio" 
              name="paymentMethod" 
              value="Pay In-Store" 
              checked={paymentMethod === 'Pay In-Store'} 
              onChange={(e) => setPaymentMethod(e.target.value)} 
              style={{ transform: 'scale(1.5)' }}
            />
            <strong>Pay In-Store (Cash/Terminal)</strong>
          </label>
          <p style={{ marginLeft: '32px', color: 'gray', fontSize: '0.9rem', marginTop: '5px' }}>
            Available for In-Store Pickup reservations only.
          </p>
        </div>

        <button 
          type="submit" 
          style={{ padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '10px' }}
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default PaymentScreen;