import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore'

const EditContactScreen = () => {
  const navigate = useNavigate();

  const [isVerified, setIsVerified] = useState(false);
  const [legalFirstName, setLegalFirstName] = useState('');
  const [legalLastName, setLegalLastName] = useState('');
  const [preferredFirstName, setPreferredFirstName] = useState('');
  const [preferredLastName, setPreferredLastName] = useState('');
  const [syncName, setSyncName] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');

  const [emailOptIn, setEmailOptIn] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [syncEmail, setSyncEmail] = useState(false);

  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [mailOptIn, setMailOptIn] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [syncAddresses, setSyncAddresses] = useState(false);
  
  const [deliveryTerrain, setDeliveryTerrain] = useState('Land');
  const [deliveryAddress, setDeliveryAddress] = useState({});

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const updateUserInfo = useAuthStore((state) => state.updateUserInfo);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        
        setIsVerified(data.isVerified || false);
        setLegalFirstName(data.firstName || '');
        setLegalLastName(data.lastName || '');
        setPreferredFirstName(data.preferredFirstName || '');
        setPreferredLastName(data.preferredLastName || '');
        setSyncName(data.syncName || false);

        setLoginEmail(data.email || '');
        
        setEmailOptIn(data.emailOptIn || false);
        setContactEmail(data.contactEmail || '');
        setSyncEmail(data.syncEmail || false);

        setSmsOptIn(data.smsOptIn || false);
        setPhoneNumber(data.phoneNumber || '');
        
        setMailOptIn(data.mailOptIn || false);
        if (data.mailingAddress) {
          setStreet(data.mailingAddress.street || '');
          setCity(data.mailingAddress.city || '');
          setPostalCode(data.mailingAddress.postalCode || '');
        }

        if (data.address) {
          setDeliveryTerrain(data.address.terrainType || 'Land');
          setDeliveryAddress(data.address);
        }

        setSyncAddresses(data.syncAddresses || false);
        setLoading(false);
      } catch {
        toast.error('Failed to load contact profile.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      
      const { data } = await axios.put('/api/users/profile', {
        preferredFirstName,
        preferredLastName,
        syncName: isVerified ? syncName : false,
        
        emailOptIn,
        contactEmail: syncEmail ? loginEmail : contactEmail,
        syncEmail: emailOptIn ? syncEmail : false,
        
        smsOptIn,
        phoneNumber,
        
        mailOptIn,
        mailingAddress: { street, city, postalCode },
        syncAddresses: (deliveryTerrain === 'Land' && mailOptIn) ? syncAddresses : false,
      });

      updateUserInfo(data);
      toast.success('Contact Preferences Updated!');
      navigate('/profile'); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update contact info');
      setUpdateLoading(false);
    }
  };

  if (loading) return <Loader />;

  const isWater = deliveryTerrain === 'Water';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 15px', fontFamily: 'sans-serif' }}>
      
      <Link to="/profile" style={{ display: 'inline-block', marginBottom: '20px', textDecoration: 'none', color: '#1890ff', fontWeight: 'bold' }}>
        &larr; Back to Profile
      </Link>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h1 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          Edit Contact Preferences
        </h1>
        
        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* SECTION 1: PREFERRED IDENTITY */}
          <div>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#111' }}>Preferred Name</h3>
            <div style={{ padding: '15px', background: !isVerified ? '#f5f5f5' : '#e6f7ff', border: `1px solid ${!isVerified ? '#ddd' : '#91d5ff'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input type="checkbox" id="syncNameCheck" checked={syncName} onChange={(e) => setSyncName(e.target.checked)} disabled={!isVerified} style={{ width: '18px', height: '18px', cursor: !isVerified ? 'not-allowed' : 'pointer' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="syncNameCheck" style={{ color: !isVerified ? '#999' : '#096dd9', fontWeight: 'bold', cursor: !isVerified ? 'not-allowed' : 'pointer' }}>Sync with my Legal Identity</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', opacity: syncName ? 0.5 : 1, pointerEvents: syncName ? 'none' : 'auto', transition: 'all 0.3s' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Preferred First Name</label>
                <input type="text" value={syncName ? legalFirstName : preferredFirstName} onChange={(e) => setPreferredFirstName(e.target.value)} placeholder="Johnny" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', background: syncName ? '#f5f5f5' : '#fff' }} />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Preferred Last Name</label>
                <input type="text" value={syncName ? legalLastName : preferredLastName} onChange={(e) => setPreferredLastName(e.target.value)} placeholder="Appleseed" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', background: syncName ? '#f5f5f5' : '#fff' }} />
              </div>
            </div>
          </div>

          {/* SECTION 2: DIGITAL CONTACT (Email & SMS) */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#111' }}>Digital Marketing</h3>
            
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <input type="checkbox" id="emailOptIn" checked={emailOptIn} onChange={(e) => setEmailOptIn(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="emailOptIn" style={{ fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer' }}>I consent to receive marketing emails.</label>
              </div>

              <div style={{ marginLeft: '30px', padding: '15px', borderLeft: '3px solid #1890ff', background: '#fafafa', opacity: emailOptIn ? 1 : 0.4, pointerEvents: emailOptIn ? 'auto' : 'none', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <input type="checkbox" id="syncEmailCheck" checked={syncEmail} onChange={(e) => setSyncEmail(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="syncEmailCheck" style={{ color: '#096dd9', fontWeight: 'bold', cursor: 'pointer' }}>Use my secure Login Email address ({loginEmail})</label>
                </div>
                
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Contact Email Address</label>
                <input 
                  type="email" 
                  value={syncEmail ? loginEmail : contactEmail} 
                  onChange={(e) => setContactEmail(e.target.value)} 
                  placeholder="marketing@example.com"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', background: syncEmail ? '#f5f5f5' : '#fff' }} 
                  required={emailOptIn && !syncEmail}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <input type="checkbox" id="smsOptIn" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="smsOptIn" style={{ fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer' }}>I consent to receive SMS marketing messages.</label>
              </div>

              <div style={{ marginLeft: '30px', padding: '15px', borderLeft: '3px solid #52c41a', background: '#fafafa', opacity: smsOptIn ? 1 : 0.4, pointerEvents: smsOptIn ? 'auto' : 'none', transition: 'all 0.3s' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Mobile Phone Number</label>
                <input 
                  type="tel" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  placeholder="(555) 123-4567"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }} 
                  required={smsOptIn}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: MAILING ADDRESS */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#111' }}>Physical Mail Marketing</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <input 
                type="checkbox" 
                id="mailOptIn" 
                checked={mailOptIn} 
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setMailOptIn(isChecked);
                  // THE FIX: Unchecking the consent clears everything back to a clean slate
                  if (!isChecked) {
                    setSyncAddresses(false);
                    setStreet('');
                    setCity('');
                    setPostalCode('');
                  }
                }} 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
              />
              <label htmlFor="mailOptIn" style={{ fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer' }}>I consent to receive physical mail and catalogs.</label>
            </div>

            <div style={{ marginLeft: '30px', padding: '15px', borderLeft: '3px solid #722ed1', background: '#fafafa', opacity: mailOptIn ? 1 : 0.4, pointerEvents: mailOptIn ? 'auto' : 'none', transition: 'all 0.3s' }}>
              
              <div style={{ padding: '12px', background: isWater ? '#f5f5f5' : '#f9f0ff', border: `1px solid ${isWater ? '#ddd' : '#d3adf7'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <input 
                  type="checkbox" 
                  id="syncCheckContact" 
                  checked={syncAddresses} 
                  onChange={(e) => setSyncAddresses(e.target.checked)} 
                  disabled={isWater} 
                  style={{ width: '16px', height: '16px', cursor: isWater ? 'not-allowed' : 'pointer' }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label htmlFor="syncCheckContact" style={{ color: isWater ? '#999' : '#531dab', fontWeight: 'bold', cursor: isWater ? 'not-allowed' : 'pointer' }}>
                    Sync with Default Delivery Address
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: syncAddresses ? 0.5 : 1, pointerEvents: syncAddresses ? 'none' : 'auto', transition: 'all 0.3s' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Street Address / PO Box</label>
                  <input type="text" value={syncAddresses ? deliveryAddress.street : street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main St" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', background: syncAddresses ? '#f5f5f5' : '#fff' }} />
                </div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '2 1 200px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>City</label>
                    <input type="text" value={syncAddresses ? deliveryAddress.city : city} onChange={(e) => setCity(e.target.value)} placeholder="Clayton" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', background: syncAddresses ? '#f5f5f5' : '#fff' }} />
                  </div>
                  <div style={{ flex: '1 1 100px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Zip Code</label>
                    <input type="text" value={syncAddresses ? deliveryAddress.postalCode : postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="13624" style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', background: syncAddresses ? '#f5f5f5' : '#fff' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <button type="submit" disabled={updateLoading} style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.1rem', cursor: updateLoading ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
            {updateLoading ? 'Saving...' : 'Save Contact Preferences'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default EditContactScreen;