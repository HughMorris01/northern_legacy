import { useEffect, useState } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';

const HomeScreen = () => {
  // 1. Set up the state to hold our data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // <-- Start loading as true
  const [error, setError] = useState('');

  // 2. Use useEffect to fire the API call as soon as the screen loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
        setLoading(false); // <-- Turn off loader when data arrives
      } catch {
        setError('Failed to fetch products from the server.');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // If loading is true, show our custom tree animation instead of the grid
  if (loading) {
    return <Loader />;
  }

  // If the server threw a real error, show it
  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}><h2>{error}</h2></div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h3>Northern Legacy Menu</h3>
      <h6>**This application is for development purposes only, sales are not real**</h6>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {products.map((product) => (
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