import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // <-- Added useLocation
import axios from '../axios';
import Loader from '../components/Loader';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');
  
  // Pull the location state to check for a security logout message
  const location = useLocation();
  const message = location.state?.message;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
        setLoading(false); 
      } catch {
        setError('Failed to fetch products from the server.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <Loader />;

  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}><h2>{error}</h2></div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* THE SECURITY BANNER */}
      {message && (
        <div style={{ 
          background: '#fff2f0', border: '1px solid #ffccc7', color: '#ff4d4f',
          padding: '12px', textAlign: 'center', marginBottom: '20px', borderRadius: '4px',
          fontWeight: 'bold', fontSize: '1rem' 
        }}>
          ⚠️ {message}
        </div>
      )}

      <h2>Northern Legacy Menu</h2>
      <h6>**This application is for development purposes only, sales are not real**</h6>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {products?.map((product) => (
          <div key={product._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h2>{product.name}</h2>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Type:</strong> {product.category}</p>
            <p><strong>Price:</strong> ${(product.price / 100).toFixed(2)}</p>
            <p><strong>THC:</strong> {product.thcContent}%</p>
            
            <Link 
              to={`/product/${product._id}`} 
              style={{ display: 'inline-block', marginTop: '10px', padding: '10px 15px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '5px' }}
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;