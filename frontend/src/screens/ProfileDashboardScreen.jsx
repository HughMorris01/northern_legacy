import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axios';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const ProfileDashboardScreen = () => { 
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  
  const cartItems = useCartStore((state) => state.cartItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showOrders, setShowOrders] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profileRes = await axios.get('/api/users/profile');
        setProfileData(profileRes.data);
      } catch {
        toast.error('Failed to load profile data.');
      }

      try {
        const ordersRes = await axios.get('/api/orders/myorders');
        setOrders(ordersRes.data);
      } catch {
        toast.error('Failed to load order history.');
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const logoutHandler = async () => {
    try {
      await axios.put('/api/users/cart', { cartItems });
    } catch (syncError) {
      console.warn('Cart sync failed, but proceeding with logout anyway.', syncError);
    }

    try {
      await axios.post('/api/users/logout');
      logout();
      clearCart();
      navigate('/login');
    } catch (error) {
      console.error('Fatal error during logout sequence', error);
    }
  };

  const deleteAccountHandler = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('You must type DELETE exactly as shown.');
      return;
    }

    try {
      await axios.delete('/api/users/profile');
      setShowDeleteModal(false);
      logout(); 
      navigate('/login');
      toast.success('Account successfully closed and data anonymized.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setShowDeleteModal(false);
    }
  };

  const passwordSubmitHandler = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setPasswordLoading(true);
      await axios.put('/api/users/profile', { password: newPassword });
      toast.success('Password successfully updated!');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setPasswordLoading(false);
    } catch {
      toast.error('Failed to update password');
      setPasswordLoading(false);
    }
  };

  if (loading) return <Loader />;

  const displayFirstName = profileData?.preferredFirstName || profileData?.firstName;
  const displayLastName = profileData?.preferredLastName || profileData?.lastName;
  const isVerified = profileData?.isVerified;

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 15px', fontFamily: 'sans-serif', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      <div style={{ borderBottom: '2px solid #111', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>
            {displayFirstName ? `${displayFirstName}'s Dashboard` : 'My Profile'}
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>Manage your identity, addresses, and order history.</p>
        </div>
        
        <button 
          onClick={logoutHandler}
          style={{ background: 'transparent', color: '#cf1322', border: '2px solid #cf1322', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#cf1322'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cf1322'; }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
        
        <div style={{ width: '100%', boxSizing: 'border-box' }}>

          <div style={{ 
            background: isVerified ? '#f6ffed' : '#fff2f0', 
            padding: '20px', 
            borderRadius: '8px', 
            border: `1px solid ${isVerified ? '#b7eb8f' : '#ffccc7'}`, 
            marginBottom: '25px',
            transition: 'all 0.3s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isVerified ? '#b7eb8f' : '#ffccc7'}`, paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: isVerified ? '#237804' : '#cf1322' }}>
                Legal Identity {isVerified ? '✓ (Verified 21+)' : '⚠️ (Pending Verification)'}
              </h3>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: isVerified ? '#111' : '#666' }}>
              <strong>Full Legal Name:</strong> {isVerified ? `${profileData?.firstName} ${profileData?.lastName}` : <span style={{ fontStyle: 'italic' }}>Pending</span>}
            </p>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: isVerified ? '#111' : '#666' }}>
              <strong>Date of Birth:</strong> {isVerified && profileData?.dateOfBirth !== '1900-01-01' ? profileData.dateOfBirth : <span style={{ fontStyle: 'italic' }}>Pending</span>}
            </p>
            <p style={{ margin: 0, fontSize: '1.05rem', color: isVerified ? '#111' : '#666' }}>
              <strong>ID Expiration Date:</strong> {isVerified && profileData?.idExpirationDate ? profileData.idExpirationDate : <span style={{ fontStyle: 'italic' }}>Pending</span>}
            </p>

            {!isVerified && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '40px 0 15px 0', color: '#cf1322', fontSize: '0.95rem', fontWeight: 'bold' }}>
                  State law requires a verified 21+ identity to browse and purchase inventory.
                </p>
                <button onClick={() => navigate('/verify')} style={{ padding: '12px 25px', background: '#cf1322', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%' }}>
                  Verify Identity Now
                </button>
                <p style={{ margin: '10px 0 0 0', color: '#cf1322', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.4' }}>
                  🔒 Identity securely vaulted via <strong>Persona</strong>. (AES-256 / SOC2 Compliant)
                </p>
              </div>
            )}
            {isVerified && (
              <div>
                <p style={{ margin: '20px 0 0 0', color: '#237804', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.4' }}>
                  🔒 Identity securely vaulted via <strong>Persona</strong>. (AES-256 / SOC2 Compliant)
                </p>
              </div>
            )}
          </div>

          <div style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111' }}>Default Delivery Address</h3>
              <button onClick={() => navigate('/profile/delivery')} style={{ padding: '6px 15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                Edit
              </button>
            </div>
            
            {profileData?.address?.street ? (
              <div style={{ fontSize: '1.05rem', lineHeight: '1.5' }}>
                <p style={{ margin: '0 0 5px 0' }}>{profileData.address.street}</p>
                <p style={{ margin: '0 0 5px 0' }}>{profileData.address.city}, NY {profileData.address.postalCode}</p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Terrain Type: <strong>{profileData.address.terrainType}</strong></p>
              </div>
            ) : (
              <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>No default address saved.</p>
            )}
          </div>

          <div style={{ border: '1px solid #eaeaea', padding: '20px 15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111' }}>Saved Payment Methods</h3>
              <button onClick={() => navigate('/profile/bank')} style={{ padding: '6px 15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                Manage
              </button>
            </div>
            
            {/* THE FIX: Displays BOTH slots elegantly */}
            <div style={{ padding: '15px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '15px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#111', fontSize: '1.05rem' }}>🏦 Aeropay Digital ACH</p>
                {profileData?.linkedAch ? (
                  <p style={{ margin: '5px 0 0 0', color: '#389e0d', fontSize: '0.9rem', fontWeight: 'bold' }}>Active Link: {profileData.linkedAch}</p>
                ) : (
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>No active account linked.</p>
                )}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#111', fontSize: '1.05rem' }}>💳 Secure Debit Card</p>
                {profileData?.linkedDebit ? (
                  <p style={{ margin: '5px 0 0 0', color: '#389e0d', fontSize: '0.9rem', fontWeight: 'bold' }}>Active Link: {profileData.linkedDebit}</p>
                ) : (
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>No active card linked.</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: '15px', padding: '12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '5px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#096dd9', lineHeight: '1.4' }}>
                🔒 <strong>Bank-Level Security:</strong> All financial data is tokenized and vaulted using SOC2-compliant AES-256 encryption. Raw account numbers are never stored on Northern Legacy servers.
              </p>
            </div>
          </div>

          <div style={{ border: '1px solid #eaeaea', padding: '20px 20px 20px 15px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111' }}>Marketing & Contact Preferences</h3>
              <button onClick={() => navigate('/profile/contact')} style={{ padding: '6px 15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                Edit
              </button>
            </div>
            
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem' }}>
              <strong>Digital Name:</strong> {displayFirstName} {displayLastName}
              {profileData?.syncName && <span style={{ fontSize: '0.8rem', color: '#1890ff', marginLeft: '10px', fontWeight: 'bold' }}>(Synced to Legal)</span>}
            </p>
            
            <div style={{ padding: '12px 15px 12px 3px', background: '#fafafa', borderRadius: '6px', marginBottom: '10px', borderLeft: profileData?.emailOptIn ? '3px solid #1890ff' : '4px solid #ccc' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '1.05rem' }}>
                <strong>Contact Email:</strong> {profileData?.emailOptIn && profileData?.contactEmail ? profileData.contactEmail : <span style={{ color: '#999', fontStyle: 'italic' }}>Opted Out</span>}
              </p>
            </div>

            <div style={{ padding: '12px 15px 12px 3px', background: '#fafafa', borderRadius: '6px', marginBottom: '10px', borderLeft: profileData?.smsOptIn ? '3px solid #52c41a' : '4px solid #ccc' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '1.05rem' }}>
                <strong>Mobile Phone:</strong> {profileData?.smsOptIn && profileData?.phoneNumber ? profileData.phoneNumber : <span style={{ color: '#999', fontStyle: 'italic' }}>Opted Out</span>}
              </p>
            </div>

            <div style={{ padding: '12px 15px 12px 3px', background: '#fafafa', borderRadius: '6px', borderLeft: profileData?.mailOptIn ? '3px solid #722ed1' : '4px solid #ccc' }}>
              <p style={{ margin: 0, fontSize: '1.05rem' }}>
                <strong>Mailing Address: </strong> 
                {profileData?.mailOptIn && profileData?.mailingAddress?.street 
                  ? `${profileData.mailingAddress.street}, ${profileData.mailingAddress.city} ${profileData.mailingAddress.postalCode}`
                  : <span style={{ color: '#999', fontStyle: 'italic' }}>Opted Out</span>
                }
              </p>
            </div>
          </div>

          <div style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111' }}>Account & Security</h3>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Secure Login Email (Unchangeable)</label>
              <input 
                type="text" 
                value={profileData?.email || ''} 
                disabled 
                style={{ width: '100%', padding: '10px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', color: '#666', cursor: 'not-allowed', boxSizing: 'border-box' }} 
              />
            </div>

            {!showPasswordForm ? (
              <button 
                onClick={() => setShowPasswordForm(true)} 
                style={{ background: 'none', border: 'none', color: '#1890ff', fontWeight: 'bold', cursor: 'pointer', padding: 0, fontSize: '0.95rem' }}
              >
                Change Password...
              </button>
            ) : (
              <form onSubmit={passwordSubmitHandler} style={{ background: '#fafafa', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginTop: '10px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>New Password</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Confirm New Password</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={passwordLoading} style={{ padding: '8px 15px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>{passwordLoading ? 'Saving...' : 'Save Password'}</button>
                  <button type="button" onClick={() => setShowPasswordForm(false)} style={{ padding: '8px 15px', background: '#e8e8e8', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Order History */}
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          
          <div 
            onClick={() => setShowOrders(!showOrders)}
            style={{ 
              borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              cursor: 'pointer', userSelect: 'none' 
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
              Order History {orders.length > 0 && `(${orders.length})`}
            </h2>
            <span style={{ 
              fontSize: '1.2rem', color: '#666',
              transform: showOrders ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.3s ease' 
            }}>
              ▼
            </span>
          </div>

          {!showOrders && orders.length > 0 && (
            <div 
              onClick={() => setShowOrders(true)}
              style={{ 
                cursor: 'pointer',
                opacity: 0.6,
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
            >
              <div style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {new Date(orders[0].createdAt).toLocaleDateString()}
                  </span>
                  <strong style={{ fontSize: '1.1rem' }}>${orders[0].totalAmount.toFixed(2)}</strong>
                  <span style={{ color: orders[0].status === 'Completed' ? '#28a745' : '#1890ff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {orders[0].status}
                  </span>
                </div>
                <div style={{ padding: '10px 20px', background: '#f5f5f5', color: '#111', borderRadius: '4px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  View Details
                </div>
              </div>
            </div>
          )}
          
          {showOrders && (
            orders.length === 0 ? (
              <div style={{ background: '#f9f9f9', padding: '30px 20px', borderRadius: '8px', border: '1px dashed #ccc', textAlign: 'center', color: '#666' }}>
                <p style={{ fontSize: '1.1rem', margin: '0 0 15px 0' }}>You haven't placed any orders yet.</p>
                <Link to="/" style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 'bold' }}>Start Shopping &rarr;</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {orders.map((order) => (
                  <div key={order._id} style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {new Date(order.orderPlacedAt).toLocaleDateString()}
                      </span>
                      <strong style={{ fontSize: '1.1rem' }}>${order.totalAmount.toFixed(2)}</strong>
                      <span style={{ color: order.status === 'Completed' ? '#28a745' : '#1890ff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {order.status}
                      </span>
                    </div>

                    <Link to={`/order/${order._id}`} style={{ padding: '10px 20px', background: '#f5f5f5', color: '#111', textDecoration: 'none', borderRadius: '4px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '0.9rem', transition: 'background 0.2s' }}>
                      View Details
                    </Link>

                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </div>

      <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '2px solid #ff4d4f', width: '100%' }}>
        <h3 style={{ color: '#ff4d4f', marginBottom: '10px', fontSize: '1.3rem' }}>Danger Zone</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>Once you delete your account, there is no going back. Please be certain.</p>
        <button onClick={() => setShowDeleteModal(true)} style={{ padding: '12px 25px', background: 'white', color: '#cf1322', border: '2px solid #ffa39e', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#fff2f0'; e.currentTarget.style.borderColor = '#cf1322'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#ffa39e'; }}>
          Close & Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginTop: 0, color: '#cf1322', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Are you absolutely sure?</h3>
            
            <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: '1.5' }}>
              This action <strong>cannot</strong> be undone. This will permanently close your account, anonymize your transaction history, and remove all your data from our servers.
            </p>
            
            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ddd' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Please type <strong>DELETE</strong> to confirm.</p>
              <input 
                type="text" 
                value={deleteConfirmationText} 
                onChange={(e) => setDeleteConfirmationText(e.target.value)} 
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '1.1rem' }} 
              />
            </div>

            <button 
              onClick={deleteAccountHandler} 
              disabled={deleteConfirmationText !== 'DELETE'}
              style={{ width: '100%', padding: '15px', background: deleteConfirmationText === 'DELETE' ? '#cf1322' : '#ffa39e', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '1.1rem', cursor: deleteConfirmationText === 'DELETE' ? 'pointer' : 'not-allowed', transition: 'background 0.3s', marginBottom: '10px' }}
            >
              I understand the consequences, delete this account
            </button>
            <button 
              onClick={() => { setShowDeleteModal(false); setDeleteConfirmationText(''); }} 
              style={{ width: '100%', padding: '15px', background: 'white', color: '#333', border: '1px solid #ccc', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileDashboardScreen;