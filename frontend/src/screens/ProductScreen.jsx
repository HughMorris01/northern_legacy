import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProductScreen = () => {
  const [product, setProduct] = useState({});
  // useParams looks at the URL (e.g., /product/12345) and grabs the "12345" part
  const { id } = useParams(); 

  useEffect(() => {
    const fetchProduct = async () => {
      // We are hitting the second API route we built earlier!
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
    };

    fetchProduct();
  }, [id]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'blue' }}>
        &larr; Back to Menu
      </Link>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h1>{product.name}</h1>
        <p><strong>Brand:</strong> {product.brand}</p>
        <hr />
        <p><strong>Description:</strong> {product.description}</p>
        <p><strong>THC Content:</strong> {product.thcContent}%</p>
        <p><strong>Testing Status:</strong> {product.testingStatus}</p>
        <p><strong>Metrc UID:</strong> <span style={{ fontFamily: 'monospace' }}>{product.metrcPackageUid}</span></p>
        
        <h2>${product.price ? (product.price / 100).toFixed(2) : '0.00'}</h2>
        
        {/* We will wire this button up to our cart logic later */}
        <button 
          disabled={product.stockQuantity === 0}
          style={{ padding: '10px 20px', background: product.stockQuantity > 0 ? 'green' : 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductScreen;