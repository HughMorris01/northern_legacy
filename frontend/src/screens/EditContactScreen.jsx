import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axios';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const EditContactScreen = () => {
  const navigate = useNavigate();

  // Identity State
  const [isVerified, setIsVerified] = useState(false);
  const [legalFirstName, setLegalFirstName] = useState('');
  const [legalLastName, setLegalLastName] = useState('');
  const [preferredFirstName, setPreferredFirstName] = useState('');
  const [preferredLastName, setPreferredLastName] = useState('');
  const [syncName, setSyncName] = useState(false);

  // Contact State
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Mailing Address State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [syncAddresses, setSyncAddresses] = useState(false);
  const [deliveryTerrain, setDeliveryTerrain] = useState('Land');
  const [deliveryAddress, setDeliveryAddress] = useState({});

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

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

        setEmail(data.email || '');
        setPhoneNumber(data.phoneNumber || '');
        
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
      
      await axios.put('/api/users/profile', {
        preferredFirstName,
        preferredLastName,
        syncName: isVerified ? syncName : false,
        email,
        phoneNumber,
        mailingAddress: { street, city, postalCode },
        syncAddresses: deliveryTerrain === 'Land' ? syncAddresses : false,
      });

      toast.success('Contact Information Updated!');
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
          Edit Contact Information
        </h1>
        
        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* SECTION 1: PREFERRED IDENTITY */}
          <div>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#111' }}>Preferred Name</h3>
            
            <div style={{ padding: '15px', background: !isVerified ? '#f5f5f5' : '#e6f7ff', border: `1px solid ${!isVerified ? '#ddd' : '#91d5ff'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="checkbox" 
                id="syncNameCheck"
                checked={syncName}
                onChange={(e) => setSyncName(e.target.checked)}
                disabled={!isVerified}
                style={{ width: '18px', height: '18px', cursor: !isVerified ? 'not-allowed' : 'pointer' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="syncNameCheck" style={{ color: !isVerified ? '#999' : '#096dd9', fontWeight: 'bold', cursor: !isVerified ? 'not-allowed' : 'pointer' }}>
                  Sync with my Legal Identity
                </label>
                {!isVerified && (
                  <span style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>
                    Sync unavailable: You must complete 21+ verification first.
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', opacity: syncName ? 0.5 : 1, pointerEvents: syncName ? 'none' : 'auto', transition: 'all 0.3s' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Preferred First Name</label>
                <input 
                  type="text" 
                  value={syncName ? legalFirstName : preferredFirstName} 
                  onChange={(e) => setPreferredFirstName(e.target.value)} 
                  placeholder="Johnny"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem', background: syncName ? '#f5f5f5' : '#fff' }} 
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Preferred Last Name</label>
                <input 
                  type="text" 
                  value={syncName ? legalLastName : preferredLastName} 
                  onChange={(e) => setPreferredLastName(e.target.value)} 
                  placeholder="Appleseed"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem', background: syncName ? '#f5f5f5' : '#fff' }} 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DIGITAL CONTACT */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#111' }}>Digital Communication</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }} 
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Phone Number</label>
                <input 
                  type="tel" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  placeholder="(555) 123-4567"
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem' }} 
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: MAILING ADDRESS */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#111' }}>Mailing Address</h3>
            
            <div style={{ padding: '15px', background: isWater ? '#f5f5f5' : '#e6f7ff', border: `1px solid ${isWater ? '#ddd' : '#91d5ff'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="checkbox" 
                id="syncCheckContact"
                checked={syncAddresses}
                onChange={(e) => setSyncAddresses(e.target.checked)}
                disabled={isWater}
                style={{ width: '18px', height: '18px', cursor: isWater ? 'not-allowed' : 'pointer' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="syncCheckContact" style={{ color: isWater ? '#999' : '#096dd9', fontWeight: 'bold', cursor: isWater ? 'not-allowed' : 'pointer' }}>
                  Sync with my Default Delivery Address
                </label>
                {isWater && (
                  <span style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>
                    Sync unavailable: Your delivery terrain is set to Water (Dock/Island).
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: syncAddresses ? 0.5 : 1, pointerEvents: syncAddresses ? 'none' : 'auto', transition: 'all 0.3s' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Street Address / PO Box</label>
                <input 
                  type="text" 
                  value={syncAddresses ? deliveryAddress.street : street} 
                  onChange={(e) => setStreet(e.target.value)} 
                  placeholder="123 Main St" 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem', background: syncAddresses ? '#f5f5f5' : '#fff' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: '2 1 200px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>City</label>
                  <input 
                    type="text" 
                    value={syncAddresses ? deliveryAddress.city : city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="Clayton" 
                    style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem', background: syncAddresses ? '#f5f5f5' : '#fff' }} 
                  />
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Zip Code</label>
                  <input 
                    type="text" 
                    value={syncAddresses ? deliveryAddress.postalCode : postalCode} 
                    onChange={(e) => setPostalCode(e.target.value)} 
                    placeholder="13624" 
                    style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box', fontSize: '1rem', background: syncAddresses ? '#f5f5f5' : '#fff' }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={updateLoading} 
            style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.1rem', cursor: updateLoading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
          >
            {updateLoading ? 'Saving...' : 'Save Contact Information'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default EditContactScreen;