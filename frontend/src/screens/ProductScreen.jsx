import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import '../styles/ProductScreen.css'; // <-- IMPORT THE NEW CSS

const ProductScreen = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [qty, setQty] = useState(1);
  const [showViewCart, setShowViewCart] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems);
  const userInfo = useAuthStore((state) => state.userInfo);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch {
        setError('Product not found or server error.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const existItem = cartItems.find((x) => x._id === product._id);
  const qtyInCart = existItem ? existItem.qty : 0;
  const availableStock = (product.stockQuantity || 0) - qtyInCart;

  // INSTANT DB SYNC HANDLER
  const addToCartHandler = async () => {
    const isSuccess = addToCart(product, Number(qty)); 
    
    if (isSuccess) {
      toast.success(`${qty}x ${product.name} added to cart!`);
      setQty(1); 
      setShowViewCart(true); 

      if (userInfo) {
        try {
          const updatedCart = useCartStore.getState().cartItems;
          await axios.put('/api/users/cart', { cartItems: updatedCart });
        } catch (err) {
          console.error('Failed to sync cart to database', err);
        }
      }
    }
  };

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}><h2>{error}</h2></div>;

  const getStrainColor = (strainType) => {
    if (strainType === 'Sativa') return { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' }; 
    if (strainType === 'Indica') return { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce' }; 
    return { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' }; 
  };

  const strain = getStrainColor(product.strainType);
  
  const isDbOutOfStock = product.stockQuantity === 0;
  const isCartMaxedOut = product.stockQuantity > 0 && availableStock === 0;
  const isVisualGrayOut = isDbOutOfStock || isCartMaxedOut; 
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(5px, 2vw, 20px)', fontFamily: 'sans-serif' }}>
      
      <Link 
        to="/" 
        style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          marginBottom: '10px', textDecoration: 'none', color: '#333', 
          fontWeight: 'bold', fontSize: '0.85rem', padding: '8px 16px',
          background: '#fff', border: '1px solid #ddd', borderRadius: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = '#ccc'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#ddd'; }}
      >
        &larr; Back to Menu
      </Link>
      
      {/* NEW CSS CLASS HERE */}
      <div className="product-card">
        
        {/* LEFT COLUMN: Image Container */}
        <div className="image-container">
          {product.isLimitedRelease && <span className="badge badge-limited">🔥 Limited</span>}
          {isDbOutOfStock && <span className="badge badge-out">Out of Stock</span>}
          {isCartMaxedOut && <span className="badge badge-maxed">Cart Maxed</span>}
          {isLowStock && !isDbOutOfStock && !isCartMaxedOut && <span className="badge badge-low">Almost Gone!</span>}

          <img 
            src={product.image || '/assets/placeholder.jpg'} 
            alt={product.name} 
            className={`product-image ${isVisualGrayOut ? 'gray-out' : ''}`}
          />
        </div>

        {/* RIGHT COLUMN: Details Container */}
        <div className="details-container">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ color: '#666', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 'bold' }}>
              {product.brand} | {product.category}
            </span>
            {product.strainType && (
              <span style={{ background: strain.bg, border: `1px solid ${strain.border}`, color: strain.text, padding: '2px 8px', borderRadius: '15px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {product.strainType}
              </span>
            )}
          </div>

          <h1 style={{ margin: '0 0 5px 0', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', lineHeight: '1.1' }}>{product.name}</h1>
          <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', color: '#111' }}>
            ${product.price ? (product.price / 100).toFixed(2) : '0.00'}
          </h2>

          <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #eee' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', lineHeight: '1.4', color: '#444' }}>
              {product.description}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
              <div>
                <span style={{ color: '#666', fontSize: '0.75rem', display: 'block' }}>THC Content</span>
                <strong style={{ fontSize: '0.9rem' }}>{product.thcContent}%</strong>
              </div>
              {product.weightInOunces > 0 && (
                <div>
                  <span style={{ color: '#666', fontSize: '0.75rem', display: 'block' }}>Weight</span>
                  <strong style={{ fontSize: '0.9rem' }}>{product.weightInOunces} oz</strong>
                </div>
              )}
            </div>
          </div>
          
          {/* CART ENGINE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isDbOutOfStock ? (
              <div style={{ padding: '10px', background: '#f5f5f5', border: '2px dashed #ccc', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>Temporarily out of stock!</p>
              </div>
            ) : availableStock > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: '1 1 70px' }}>
                  <label htmlFor="qty" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666' }}>Qty</label>
                  <select 
                    id="qty"
                    value={qty} 
                    onChange={(e) => setQty(e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '2px solid #ccc', fontSize: '1rem', background: 'white', cursor: 'pointer', height: '100%' }}
                  >
                    {[...Array(availableStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={addToCartHandler}
                  style={{ flex: '3 1 150px', padding: '10px 15px', background: 'black', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 'bold', alignSelf: 'flex-end', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#333'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'black'}
                >
                  Add to Cart
                </button>
              </div>
            ) : (
               <div style={{ padding: '10px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#d48806', fontWeight: 'bold', margin: 0, fontSize: '0.85rem' }}>
                  Temporarily out of stock!
                </p>
              </div>
            )}

            {showViewCart && (
              <Link 
                to="/cart" 
                style={{ 
                  display: 'block', width: '100%', textAlign: 'center', padding: '10px', 
                  background: '#1890ff', color: 'white', textDecoration: 'none', 
                  borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', 
                  transition: 'background 0.2s', boxSizing: 'border-box'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#096dd9'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1890ff'}
              >
                View Cart & Checkout &rarr;
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductScreen;