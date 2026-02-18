import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CheckoutSteps from '../components/CheckoutSteps';
import { TAX_RATES } from '../utils/constants'; 
import axios from '../axios'; 
import { toast } from 'react-toastify';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();

  const cartItems = useCartStore((state) => state.cartItems);
  const shippingAddress = useCartStore((state) => state.shippingAddress);
  const paymentMethod = useCartStore((state) => state.paymentMethod);
  const clearCart = useCartStore((state) => state.clearCart);
  
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inventoryIssue, setInventoryIssue] = useState(null); 

  // Modal State Machine
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('select-bank'); 
  const [selectedBank, setSelectedBank] = useState('');
  const [fakeUsername, setFakeUsername] = useState('');
  const [fakePassword, setFakePassword] = useState('');

  useEffect(() => {
    if (cartItems.length === 0) return;

    if (!shippingAddress.address) {
      navigate('/shipping');
    } else if (!paymentMethod) {
      navigate('/payment');
    }
  }, [shippingAddress, paymentMethod, navigate, cartItems.length]);

  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

  const itemsPrice = cartItems.reduce((acc, item) => acc + (item.price / 100) * item.qty, 0);
  const exciseTax = itemsPrice * TAX_RATES.EXCISE; 
  const localTax = itemsPrice * TAX_RATES.LOCAL;  
  const stateTax = itemsPrice * TAX_RATES.STATE;  
  const totalPrice = itemsPrice + exciseTax + localTax + stateTax;

  const triggerOrderHandler = () => {
    if (paymentMethod === 'Aeropay (ACH)') {
      setModalStep('select-bank'); 
      setFakeUsername('');
      setFakePassword('');
      setShowModal(true);
    } else {
      executeFinalOrder();
    }
  };

  const executeFinalOrder = async () => {
    try {
      setLoading(true);
      setError('');
      setInventoryIssue(null);

      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        totalAmount: totalPrice,
      });

      clearCart();
      navigate(`/order/${data._id}`); 
      
    } catch (err) {
      if (err.response?.data?.errorType === 'INVENTORY_SHORTAGE' || err.response?.status === 409) {
        setInventoryIssue(err.response.data);
        toast.error('Cart update required to proceed.');
      } else {
        setError(err.response?.data?.message || 'Failed to place order.');
      }
    } finally {
      setLoading(false);
    }
  };

  // THE FIX: Solves the Zustand Accumulator Bug
  const fixCartHandler = () => {
    if (inventoryIssue.remainingQty === 0) {
      removeFromCart(inventoryIssue.product._id);
      toast.info(`${inventoryIssue.product.name} removed from cart.`);
      setInventoryIssue(null); 
    } else {
      // 1. Wipe the item completely out of the cart first
      removeFromCart(inventoryIssue.product._id);
      
      // 2. Wait a microsecond for Zustand to update, then inject the exact fresh quantity
      setTimeout(() => {
        addToCart(inventoryIssue.product, inventoryIssue.remainingQty);
        toast.success(`Cart corrected to ${inventoryIssue.remainingQty} available units.`);
        setInventoryIssue(null); 
      }, 50);
    }
  };

  const handleBankSelect = (bankName) => {
    setSelectedBank(bankName);
    setModalStep('login');
  };

  // THE FIX: Solves the overlapping timeout freeze
  const handleBankLogin = (e) => {
    e.preventDefault();
    if (modalStep === 'processing' || modalStep === 'success') return; // Blocks double-clicks
    
    setModalStep('processing');
    
    setTimeout(() => {
      setModalStep('success');
      setTimeout(() => {
        setShowModal(false);
        executeFinalOrder(); 
      }, 1500);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <CheckoutSteps step1 step2 step3 step4 step5 />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '30px' }}>
        
        {/* LEFT COLUMN: Review Info */}
        <div>
          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Shipping / Delivery</h2>
            <p><strong>Terrain Type: </strong> {shippingAddress.terrainType}</p>
            <p>
              <strong>Address: </strong> 
              {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode}
            </p>
          </div>

          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Payment Method</h2>
            <p><strong>Method: </strong> {paymentMethod}</p>
          </div>

          <div>
            <h2 style={{ marginBottom: '15px' }}>Order Items</h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {cartItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#1890ff', fontWeight: 'bold' }}>
                      {item.name}
                    </Link>
                    <span>
                      {item.qty} x ${(item.price / 100).toFixed(2)} = <strong>${((item.qty * item.price) / 100).toFixed(2)}</strong>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div style={{ border: '1px solid #ccc', padding: '25px', borderRadius: '8px', height: 'fit-content', background: '#f9f9f9', position: 'sticky', top: '20px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Order Summary</h2>
          
          {error && !inventoryIssue && <div style={{ background: '#ff4d4f', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

          {/* DYNAMIC INVENTORY RESOLUTION UI */}
          {inventoryIssue && (
            <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', padding: '15px', borderRadius: '8px', marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
              <h3 style={{ color: '#cf1322', margin: '0 0 10px 0', fontSize: '1.1rem' }}>⚠️ Cart Adjustment Needed</h3>
              <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>{inventoryIssue.message}</p>
              
              <button 
                onClick={fixCartHandler}
                style={{ width: '100%', padding: '10px', background: '#cf1322', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {inventoryIssue.remainingQty === 0 
                  ? `Remove ${inventoryIssue.product.name} from Cart` 
                  : `Update Cart to ${inventoryIssue.remainingQty} Units`}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items:</span>
              <span>${addDecimals(itemsPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>NYS Excise Tax ({(TAX_RATES.EXCISE * 100).toFixed(0)}%):</span>
              <span>${addDecimals(exciseTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Local Retail Tax ({(TAX_RATES.LOCAL * 100).toFixed(0)}%):</span>
              <span>${addDecimals(localTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>State Sales Tax ({(TAX_RATES.STATE * 100).toFixed(0)}%):</span>
              <span>${addDecimals(stateTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ddd', paddingTop: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Total:</span>
              <span>${addDecimals(totalPrice)}</span>
            </div>

            <button 
              onClick={triggerOrderHandler}
              disabled={cartItems.length === 0 || loading || inventoryIssue}
              style={{ 
                width: '100%', padding: '15px', marginTop: '10px', 
                background: (cartItems.length === 0 || loading || inventoryIssue) ? '#ccc' : 'black', 
                color: 'white', border: 'none', borderRadius: '5px', 
                cursor: (cartItems.length === 0 || loading || inventoryIssue) ? 'not-allowed' : 'pointer', 
                fontSize: '1.1rem', fontWeight: 'bold', transition: 'background 0.3s'
              }}
            >
              {loading ? 'Processing...' : (paymentMethod === 'Aeropay (ACH)' ? 'Link Bank & Place Order' : 'Place Order')}
            </button>
          </div>
        </div>

      </div>

      {/* MOCK AEROPAY MODAL */}
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
                <form onSubmit={handleBankLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input type="text" placeholder="Online ID" value={fakeUsername} onChange={(e) => setFakeUsername(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                  <input type="password" placeholder="Passcode" value={fakePassword} onChange={(e) => setFakePassword(e.target.value)} style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                  <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center', margin: 0 }}>By logging in, you agree to the secure transfer of funds.</p>
                  
                  {/* THE FIX: Button locks down visually and functionally while processing */}
                  <button 
                    type="submit" 
                    disabled={modalStep === 'processing' || modalStep === 'success'}
                    style={{ 
                      padding: '15px', 
                      background: (modalStep === 'processing' || modalStep === 'success') ? '#ccc' : '#1890ff', 
                      color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', 
                      cursor: (modalStep === 'processing' || modalStep === 'success') ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    {modalStep === 'processing' || modalStep === 'success' ? 'Linking Account...' : 'Agree & Link Account'}
                  </button>
                </form>
              </div>
            )}

            {modalStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #1890ff', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                <h3>Authorizing Transfer...</h3>
                <p style={{ color: '#666' }}>Securely communicating with {selectedBank}.</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {modalStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ background: '#52c41a', color: 'white', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>✓</div>
                <h3 style={{ color: '#52c41a' }}>Account Linked!</h3>
                <p style={{ color: '#666' }}>Redirecting to order confirmation...</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrderScreen;