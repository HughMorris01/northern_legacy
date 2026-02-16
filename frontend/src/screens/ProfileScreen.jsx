import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from '../axios';
import Loader from '../components/Loader';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const userInfo = useAuthStore((state) => state.userInfo);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const { data } = await axios.get('/api/orders/myorders');
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [userInfo, navigate]);

  // --- ID Expiration Logic Engine ---
  let expiryStatus = 'valid'; 
  let formattedExpiryDate = userInfo?.idExpirationDate || 'N/A';

  if (userInfo?.idExpirationDate && userInfo.idExpirationDate !== 'Sandbox Mode') {
    const expiryDate = new Date(userInfo.idExpirationDate);
    formattedExpiryDate = expiryDate.toLocaleDateString();
    
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(today.getMonth() + 1);

    if (expiryDate < today) {
      expiryStatus = 'expired';
    } else if (expiryDate <= oneMonthFromNow) {
      expiryStatus = 'warning';
    } else if (userInfo?.idExpirationDate === 'Sandbox Mode') {
    expiryStatus = 'valid'; 
    // This gives you the specific string you requested
    formattedExpiryDate = 'Sandbox Mode, No Expiration'; 
  }
    
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        
        {/* LEFT COLUMN: User Information */}
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', height: 'fit-content', background: '#f9f9f9' }}>
          <h2 style={{ marginTop: 0, borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>My Profile</h2>
          <p><strong>First Name:</strong> {userInfo.firstName}</p>
          <p><strong>Last Name:</strong> {userInfo.lastName}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Account Role:</strong> <span style={{ textTransform: 'capitalize' }}>{userInfo.role}</span></p>
          
          <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', background: userInfo.isVerified ? '#e6ffed' : '#fff1f0', border: `1px solid ${userInfo.isVerified ? '#34d058' : '#ffa39e'}` }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: userInfo.isVerified ? 'green' : '#cf1322' }}>
              ID Verification Status: {userInfo.isVerified ? 'Verified 21+' : 'Unverified'}
            </p>
            
            {!userInfo.isVerified && (
              <Link to="/verify" style={{ display: 'inline-block', marginTop: '10px', padding: '8px 16px', background: '#cf1322', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Verify Identity Now
              </Link>
            )}
          </div>

          {/* NEW: Expiration & Audit Display */}
          {userInfo.isVerified && userInfo.idExpirationDate && (
            <div style={{ 
              marginTop: '15px', padding: '15px', borderRadius: '5px', fontWeight: 'bold',
              background: expiryStatus === 'expired' ? '#fff1f0' : expiryStatus === 'warning' ? '#fffbe6' : '#f6ffed',
              border: `1px solid ${expiryStatus === 'expired' ? '#ffa39e' : expiryStatus === 'warning' ? '#ffe58f' : '#b7eb8f'}`,
              color: expiryStatus === 'expired' ? '#cf1322' : expiryStatus === 'warning' ? '#d48806' : '#389e0d'
            }}>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {expiryStatus === 'expired' ? '🛑' : expiryStatus === 'warning' ? '⚠️' : '✅'}
                ID Expiration: {formattedExpiryDate}
              </p>

              {/* Added Reference Number for Audit Trail */}
              {userInfo.verificationRefNumber && (
                <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#666', fontWeight: 'normal' }}>
                  Ref #: {userInfo.verificationRefNumber}
                </p>
              )}

              {expiryStatus === 'expired' && (
                <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#666', fontWeight: 'normal' }}>
                  Your ID has expired. Please update your verification to continue ordering.
                </p>
              )}
              {expiryStatus === 'warning' && (
                <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#666', fontWeight: 'normal' }}>
                  Your ID expires in less than 30 days. Please prepare to update it.
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Order History */}
        <div>
          <h2 style={{ marginTop: 0, borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>My Orders</h2>
          
          {loading ? (
            <Loader />
          ) : error ? (
            <div style={{ background: '#ff4d4f', color: 'white', padding: '10px', borderRadius: '5px' }}>{error}</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
              You have not placed any orders yet. <Link to="/" style={{ color: 'blue' }}>Start shopping</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', background: '#f4f4f4' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>DATE</th>
                    <th style={{ padding: '12px' }}>TOTAL</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                      <td style={{ padding: '12px' }}>{order.createdAt.substring(0, 10)}</td>
                      <td style={{ padding: '12px' }}>${(order.totalAmount).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                          background: order.status === 'Completed' ? '#e6ffed' : '#fffbe6',
                          color: order.status === 'Completed' ? 'green' : '#d48806'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Link to={`/order/${order._id}`} style={{ padding: '6px 12px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9rem' }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfileScreen;