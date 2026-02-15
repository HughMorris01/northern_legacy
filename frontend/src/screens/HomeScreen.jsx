import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const HomeScreen = () => {
  // 1. Set up the state to hold our data
  const [products, setProducts] = useState([]);

  // 2. Use useEffect to fire the API call as soon as the screen loads
  useEffect(() => {
    const fetchProducts = async () => {
      // Because of our proxy, we don't need to type http://localhost:5000
      const { data } = await axios.get('/api/products'); 
      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🌲 Northern Legacy Menu</h1>
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {products.map((product) => (
          <Link to={`/product/${product._id}`} key={product._id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', cursor: 'pointer' }}>
              <h3>{product.name}</h3>
              <p><strong>Brand:</strong> {product.brand}</p>
              <p><strong>Type:</strong> {product.strainType} {product.category}</p>
              <p><strong>Price:</strong> ${(product.price / 100).toFixed(2)}</p>
              <p><strong>THC:</strong> {product.thcContent}%</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;