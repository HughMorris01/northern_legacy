import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import useCartStore from '../store/cartStore';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const ProductScreen = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [qty, setQty] = useState(1);

  const addToCart = useCartStore((state) => state.addToCart);
  // Pull the full cart to check existing quantities
  const cartItems = useCartStore((state) => state.cartItems);

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

  // THE LOCAL INVENTORY MATH
  const existItem = cartItems.find((x) => x._id === product._id);
  const qtyInCart = existItem ? existItem.qty : 0;
  const availableStock = (product.stockQuantity || 0) - qtyInCart;

  const addToCartHandler = () => {
    addToCart(product, Number(qty));
    toast.success(`${qty}x ${product.name} added to cart!`);
    setQty(1); // Reset dropdown back to 1 after adding
  };

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}><h2>{error}</h2></div>;

  const getStrainColor = (strainType) => {
    if (strainType === 'Sativa') return { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' }; 
    if (strainType === 'Indica') return { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce' }; 
    return { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' }; 
  };

  const strain = getStrainColor(product.strainType);
  const isCompletelyOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', textDecoration: 'none', color: '#1890ff', fontWeight: 'bold' }}>
        &larr; Back to Menu
      </Link>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        
        {/* LEFT COLUMN: Image & Badges */}
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          {product.isLimitedRelease && (
            <span style={{ position: 'absolute', top: '15px', left: '-10px', background: '#e0282e', color: 'white', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              🔥 Limited Drop
            </span>
          )}
          {isCompletelyOutOfStock && (
            <span style={{ position: 'absolute', top: '15px', right: '-10px', background: '#555', color: 'white', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              Out of Stock
            </span>
          )}
          {isLowStock && !isCompletelyOutOfStock && (
            <span style={{ position: 'absolute', top: '15px', right: '-10px', background: '#ff4d4f', color: 'white', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              Almost Gone! ({product.stockQuantity} total left)
            </span>
          )}

          <img 
            src={product.image || '/assets/placeholder.jpg'} 
            alt={product.name} 
            style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', borderRadius: '8px', opacity: isCompletelyOutOfStock ? 0.6 : 1 }} 
          />
        </div>

        {/* RIGHT COLUMN: Product Details */}
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ color: '#666', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', fontWeight: 'bold' }}>
              {product.brand} | {product.category}
            </span>
            {product.strainType && (
              <span style={{ background: strain.bg, border: `1px solid ${strain.border}`, color: strain.text, padding: '3px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {product.strainType}
              </span>
            )}
          </div>

          <h1 style={{ margin: '0 0 15px 0', fontSize: '2.5rem', lineHeight: '1.2' }}>{product.name}</h1>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '2rem', color: '#111' }}>
            ${product.price ? (product.price / 100).toFixed(2) : '0.00'}
          </h2>

          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #eee' }}>
            <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem', lineHeight: '1.6', color: '#444' }}>
              {product.description}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
              <div>
                <span style={{ color: '#666', fontSize: '0.9rem', display: 'block' }}>THC Content</span>
                <strong style={{ fontSize: '1.1rem' }}>{product.thcContent}%</strong>
              </div>
              {product.weightInOunces > 0 && (
                <div>
                  <span style={{ color: '#666', fontSize: '0.9rem', display: 'block' }}>Weight</span>
                  <strong style={{ fontSize: '1.1rem' }}>{product.weightInOunces} oz</strong>
                </div>
              )}
            </div>
          </div>
          
          {/* DYNAMIC CART ENGINE */}
          {isCompletelyOutOfStock ? (
            <div style={{ padding: '20px', background: '#f5f5f5', border: '2px dashed #ccc', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: '#666', fontWeight: 'bold', margin: 0, fontSize: '1.2rem' }}>Currently Unavailable</p>
              <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '0.9rem' }}>Check back later for restocks.</p>
            </div>
          ) : availableStock > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label htmlFor="qty" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#666' }}>Quantity</label>
                <select 
                  id="qty"
                  value={qty} 
                  onChange={(e) => setQty(e.target.value)}
                  style={{ padding: '15px 20px', borderRadius: '8px', border: '2px solid #ccc', fontSize: '1.1rem', background: 'white', cursor: 'pointer', height: '100%' }}
                >
                  {/* Loop stops at availableStock instead of total stock */}
                  {[...Array(availableStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={addToCartHandler}
                style={{ flex: 1, padding: '15px 30px', background: 'black', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', transition: 'background 0.2s', alignSelf: 'flex-end' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#333'}
                onMouseOut={(e) => e.currentTarget.style.background = 'black'}
              >
                Add to Cart
              </button>
            </div>
          ) : (
            <div style={{ padding: '20px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: '#d48806', fontWeight: 'bold', margin: 0, fontSize: '1.1rem' }}>
                Maximum quantity reached.
              </p>
              <p style={{ margin: '5px 0 0 0', color: '#d48806', fontSize: '0.9rem' }}>
                You already have all {product.stockQuantity} available units in your cart.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductScreen;