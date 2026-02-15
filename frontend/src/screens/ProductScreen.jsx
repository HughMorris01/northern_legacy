import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import axios from 'axios';
import useCartStore from '../store/cartStore'; // Imported our new Zustand store

const ProductScreen = () => {
  const [product, setProduct] = useState({});
  const [qty, setQty] = useState(1); // State to track the dropdown quantity
  const { id } = useParams();
  const navigate = useNavigate(); // Used to redirect the user

  // Pull the addToCart function directly from our Zustand store
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
    };
    fetchProduct();
  }, [id]);

  // The function that runs when the button is clicked
  const addToCartHandler = () => {
    addToCart(product, Number(qty));
    navigate('/cart'); // Instantly redirect them to the cart page
  };

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
        <p><strong>Weight per unit:</strong> {product.weightInOunces} oz</p>
        
        <h2>${product.price ? (product.price / 100).toFixed(2) : '0.00'}</h2>
        
        {/* Only show the quantity selector and Add to Cart button if it's in stock */}
        {product.stockQuantity > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
            <select 
              value={qty} 
              onChange={(e) => setQty(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px' }}
            >
              {/* Create a dropdown list based on exactly how many items are in stock */}
              {[...Array(product.stockQuantity).keys()].map((x) => (
                <option key={x + 1} value={x + 1}>
                  {x + 1}
                </option>
              ))}
            </select>

            <button 
              onClick={addToCartHandler}
              style={{ padding: '10px 20px', background: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Add to Cart
            </button>
          </div>
        ) : (
          <p style={{ color: 'red', fontWeight: 'bold', marginTop: '15px' }}>Out of Stock</p>
        )}
      </div>
    </div>
  );
};

export default ProductScreen;