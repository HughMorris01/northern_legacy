import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore'; 

const CheckoutSteps = ({ step1, step2, step3, step4, step5 }) => {
  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const isPickup = shippingAddress?.address === 'In-Store Pickup';

  // 3-Color Logic Engine
  // Dark Green = Completed, Light Green = Active, Gray = Future/Skipped
  const getStepStyle = (isCurrentProp, isNextProp) => {
    if (isCurrentProp && isNextProp) {
      return { borderBottom: '4px solid #1e8449', color: 'black' }; 
    }
    if (isCurrentProp && !isNextProp) {
      return { borderBottom: '4px solid #2ecc71', color: 'black' }; 
    }
    return { borderBottom: '4px solid #ddd', color: '#999' }; 
  };

  return (
    <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px', marginBottom: '30px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
      
      <div style={{ ...getStepStyle(step1, step2), paddingBottom: '5px' }}>
        {step1 ? <Link to='/login' style={{color: 'inherit', textDecoration: 'none'}}>LOGIN</Link> : 'LOGIN'}
      </div>
      
      {/* If pickup, the next step after TYPE is PAY (step4) */}
      <div style={{ ...getStepStyle(step2, isPickup ? step4 : step3), paddingBottom: '5px' }}>
        {step2 ? <Link to='/order-type' style={{color: 'inherit', textDecoration: 'none'}}>TYPE</Link> : 'TYPE'}
      </div>
      
      {/* THE FIX: If isPickup is true, force getStepStyle to evaluate as false (Gray) */}
      <div style={{ ...(isPickup ? getStepStyle(false, false) : getStepStyle(step3, step4)), paddingBottom: '5px', opacity: isPickup ? 0.4 : 1 }}>
        {isPickup ? (
          <span style={{ textDecoration: 'line-through', color: '#999' }}>SHIP</span>
        ) : step3 ? (
          <Link to='/shipping' style={{color: 'inherit', textDecoration: 'none'}}>SHIP</Link>
        ) : (
          'SHIP'
        )}
      </div>

      <div style={{ ...getStepStyle(step4, step5), paddingBottom: '5px' }}>
        {step4 ? <Link to='/payment' style={{color: 'inherit', textDecoration: 'none'}}>PAY</Link> : 'PAY'}
      </div>
      
      <div style={{ ...getStepStyle(step5, false), paddingBottom: '5px' }}>
        {step5 ? <Link to='/placeorder' style={{color: 'inherit', textDecoration: 'none'}}>PLACE</Link> : 'PLACE'}
      </div>

    </nav>
  );
};

export default CheckoutSteps;