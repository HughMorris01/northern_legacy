import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axios';
import useAuthStore from '../store/authStore';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // UI State
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

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
        // Updated to match your backend route fix!
        const ordersRes = await axios.get('/api/orders/myorders');
        setOrders(ordersRes.data);
      } catch {
        toast.error('Failed to load order history.');
      }

      setLoading(false);
    };

    fetchData();
  }, []);

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

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 15px', fontFamily: 'sans-serif', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      <div style={{ borderBottom: '2px solid #111', paddingBottom: '10px', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>My Profile</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
        
        {/* LEFT COLUMN: Identity, Address, Bank Info */}
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          
          {/* THE VERIFICATION BANNER */}
          <div style={{ background: profileData?.isVerified ? '#f6ffed' : '#fff2f0', border: `1px solid ${profileData?.isVerified ? '#b7eb8f' : '#ffccc7'}`, padding: '20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ color: profileData?.isVerified ? '#389e0d' : '#cf1322', fontWeight: 'bold', margin: 0, fontSize: '1.1rem' }}>
              ID Verification Status: {profileData?.isVerified ? 'Verified 21+' : 'Pending / Not Verified'}
            </p>
            
            {!profileData?.isVerified && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>
                  State law requires a verified 21+ identity to browse and purchase inventory.
                </p>
                <button onClick={() => navigate('/verify')} style={{ padding: '12px 25px', background: '#cf1322', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%' }}>
                  Verify Identity Now
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '15px', color: '#888', fontSize: '0.85rem' }}>
                  <span>🔒 Securely powered by:</span>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>Apple</span>
                  <span>|</span>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>Google</span>
                  <span>|</span>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>Persona</span>
                </div>
              </div>
            )}
          </div>

          {/* LEGAL IDENTITY FIELDS (Locked) */}
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', border: '1px solid #e8e8e8', marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#111', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Legal Identity</h3>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem' }}><strong>Full Legal Name:</strong> {profileData?.firstName} {profileData?.lastName}</p>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem' }}><strong>Date of Birth:</strong> {profileData?.dateOfBirth || 'Not Provided'}</p>
            <p style={{ margin: 0, fontSize: '1.05rem' }}><strong>ID Expiration Date:</strong> {profileData?.idExpirationDate || 'Not Provided'}</p>
          </div>

          {/* CONTACT INFO FIELDS */}
          <div style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111' }}>Contact Information</h3>
              <button onClick={() => navigate('/profile/contact')} style={{ padding: '6px 15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                Edit
              </button>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem' }}><strong>Email:</strong> {profileData?.email}</p>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem' }}><strong>Phone:</strong> {profileData?.phoneNumber || <span style={{ color: '#999', fontStyle: 'italic' }}>Not Provided</span>}</p>
            <p style={{ margin: 0, fontSize: '1.05rem' }}>
              <strong>Mailing Address: </strong> 
              {profileData?.mailingAddress?.street 
                ? `${profileData.mailingAddress.street}, ${profileData.mailingAddress.city} ${profileData.mailingAddress.postalCode}`
                : <span style={{ color: '#999', fontStyle: 'italic' }}>Not Provided</span>
              }
            </p>
          </div>

          {/* DELIVERY ADDRESS */}
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

          {/* SAVED BANK ACCOUNT UI */}
          <div style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111' }}>Saved Payment Methods</h3>
              <button onClick={() => navigate('/profile/bank')} style={{ padding: '6px 15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                Manage
              </button>
            </div>
            
            <div style={{ padding: '15px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#111', fontSize: '1.05rem' }}>🏦 Aeropay Digital ACH</p>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>No active account linked.</p>
              </div>
            </div>

            <div style={{ marginTop: '15px', padding: '12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '5px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#096dd9', lineHeight: '1.4' }}>
                🔒 <strong>Bank-Level Security:</strong> All financial data is tokenized and vaulted using SOC2-compliant AES-256 encryption. Raw account numbers are never stored on Northern Legacy servers.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Order History */}
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.5rem' }}>Order History</h2>
          
          {orders.length === 0 ? (
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
                      {new Date(order.createdAt).toLocaleDateString()}
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
          )}
        </div>

      </div>

      {/* DANGER ZONE */}
      <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '2px solid #ff4d4f', width: '100%' }}>
        <h3 style={{ color: '#ff4d4f', marginBottom: '10px', fontSize: '1.3rem' }}>Danger Zone</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>Once you delete your account, there is no going back. Please be certain.</p>
        <button onClick={() => setShowDeleteModal(true)} style={{ padding: '12px 25px', background: 'white', color: '#cf1322', border: '2px solid #ffa39e', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#fff2f0'; e.currentTarget.style.borderColor = '#cf1322'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#ffa39e'; }}>
          Close & Delete Account
        </button>
      </div>

      {/* GITHUB-STYLE DELETE MODAL */}
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

export default ProfileScreen;