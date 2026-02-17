import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import useAuthStore from '../store/authStore';
import Loader from '../components/Loader';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // Form State (Only for editable fields)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [terrainType, setTerrainType] = useState('Land');

  // UI State
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // <-- The Magic Toggle
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        setProfileData(data);
        
        if (data.address) {
          setStreet(data.address.street || '');
          setCity(data.address.city || '');
          setPostalCode(data.address.postalCode || '');
          setTerrainType(data.address.terrainType || 'Land');
        }
        setLoading(false);
      } catch {
        setError('Failed to load profile data.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setUpdateLoading(true);
      setError('');
      setMessage('');
      
      const { data } = await axios.put('/api/users/profile', {
        password,
        address: { street, city, postalCode, terrainType }
      });

      // Update local view with fresh data
      setProfileData({ ...profileData, address: data.address });
      setMessage('Profile Successfully Updated!');
      setPassword('');
      setConfirmPassword('');
      setIsEditing(false); // Close the form
      setUpdateLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setUpdateLoading(false);
    }
  };

  const deleteAccountHandler = async () => {
    if (window.confirm('Are you absolutely sure? This will permanently close your account and anonymize your data. This action cannot be undone.')) {
      try {
        await axios.delete('/api/users/profile');
        logout(); 
        navigate('/login');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete account');
      }
    }
  };

  if (loading) return <Loader />;

  // MOBILE FIX: Added boxSizing and overflowX to the main wrapper
  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 15px', fontFamily: 'sans-serif', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        
        {/* LEFT COLUMN: Profile Data & Settings */}
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>My Profile</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} style={{ padding: '5px 15px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Edit Settings
              </button>
            )}
          </div>
          
          {/* Verification Status Banner */}
          <div style={{ background: profileData?.isVerified ? '#f6ffed' : '#fff2f0', border: `1px solid ${profileData?.isVerified ? '#b7eb8f' : '#ffccc7'}`, padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
            <p style={{ color: profileData?.isVerified ? '#389e0d' : '#cf1322', fontWeight: 'bold', margin: 0 }}>
              ID Verification Status: {profileData?.isVerified ? 'Verified 21+' : 'Pending / Not Verified'}
            </p>
          </div>

          {error && <div style={{ background: '#ff4d4f', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
          {message && <div style={{ background: '#52c41a', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}

          {/* LOCKED IDENTITY FIELDS (Always visible, never editable) */}
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', border: '1px solid #e8e8e8', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.85rem', textTransform: 'uppercase' }}>Locked Identity Information</h4>
            <p style={{ margin: '0 0 10px 0' }}><strong>Name:</strong> {profileData?.firstName} {profileData?.lastName}</p>
            <p style={{ margin: '0 0 10px 0' }}><strong>Email:</strong> {profileData?.email}</p>
            <p style={{ margin: 0 }}><strong>Date of Birth:</strong> {profileData?.dateOfBirth || 'Not Provided'}</p>
          </div>

          {/* DYNAMIC SECTION: Static View OR Edit Form */}
          {!isEditing ? (
            /* STATIC VIEW */
            <div>
              <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Default Delivery Address</h3>
              {profileData?.address?.street ? (
                <div>
                  <p style={{ margin: '0 0 5px 0' }}>{profileData.address.street}</p>
                  <p style={{ margin: '0 0 5px 0' }}>{profileData.address.city}, NY {profileData.address.postalCode}</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Terrain: {profileData.address.terrainType}</p>
                </div>
              ) : (
                <p style={{ color: '#999', fontStyle: 'italic' }}>No default address saved.</p>
              )}
            </div>
          ) : (
            /* EDIT FORM VIEW */
            <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <h3 style={{ marginBottom: '15px' }}>Update Delivery Address</h3>
                
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Street Address / Plus Code</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main St" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '15px' }} />

                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Clayton" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: '1 1 100px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Zip</label>
                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="13624" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Default Terrain</label>
                <select value={terrainType} onChange={(e) => setTerrainType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}>
                  <option value="Land">Land (Standard Street Address)</option>
                  <option value="Water">Water (Island / Dock Delivery)</option>
                </select>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '5px' }}>
                <h3 style={{ marginBottom: '15px' }}>Change Password (Optional)</h3>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '15px' }} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '15px', background: '#f5f5f5', color: '#333', border: '1px solid #ccc', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={updateLoading} style={{ flex: 2, padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: updateLoading ? 'not-allowed' : 'pointer' }}>
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* DANGER ZONE */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #ff4d4f' }}>
            <h3 style={{ color: '#ff4d4f', marginBottom: '10px' }}>Danger Zone</h3>
            <button onClick={deleteAccountHandler} style={{ padding: '10px 20px', background: 'white', color: '#ff4d4f', border: '2px solid #ff4d4f', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              Close & Delete Account
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Order History */}
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>My Orders</h2>
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center', color: '#666' }}>
            <p>Your order history will appear here.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileScreen;