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

  const existItem = cartItems.find((x) => x._id === product._id);
  const qtyInCart = existItem ? existItem.qty : 0;
  const availableStock = (product.stockQuantity || 0) - qtyInCart;

  const addToCartHandler = () => {
    addToCart(product, Number(qty));
    toast.success(`${qty}x ${product.name} added to cart!`);
    setQty(1); 
  };

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}><h2>{error}</h2></div>;

  const getStrainColor = (strainType) => {
    if (strainType === 'Sativa') return { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' }; 
    if (strainType === 'Indica') return { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce' }; 
    return { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' }; 
  };

  const strain = getStrainColor(product.strainType);
  
  // NEW LOGIC: Separating DB stock from Cart logic
  const isDbOutOfStock = product.stockQuantity === 0;
  const isCartMaxedOut = product.stockQuantity > 0 && availableStock === 0;
  const isVisualGrayOut = isDbOutOfStock || isCartMaxedOut; // Triggers the image gray-out
  
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(5px, 2vw, 20px)', fontFamily: 'sans-serif' }}>
      
      <Link to="/" style={{ display: 'inline-block', marginBottom: '10px', textDecoration: 'none', color: '#1890ff', fontWeight: 'bold', fontSize: '0.85rem' }}>
        &larr; Back to Menu
      </Link>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(15px, 3vw, 40px)', background: '#fff', padding: 'clamp(10px, 2vw, 20px)', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Image */}
        <div style={{ flex: '1 1 300px', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '250px' }}>
          
          {product.isLimitedRelease && (
            <span style={{ position: 'absolute', top: '10px', left: '-5px', background: '#e0282e', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              🔥 Limited
            </span>
          )}
          {isDbOutOfStock && (
            <span style={{ position: 'absolute', top: '10px', right: '-5px', background: '#555', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 10 }}>
              Out of Stock
            </span>
          )}
          {isCartMaxedOut && (
            <span style={{ position: 'absolute', top: '10px', right: '-5px', background: '#d48806', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 10 }}>
              Cart Maxed
            </span>
          )}
          {isLowStock && !isDbOutOfStock && !isCartMaxedOut && (
            <span style={{ position: 'absolute', top: '10px', right: '-5px', background: '#ff4d4f', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 10 }}>
              Almost Gone!
            </span>
          )}

          <img 
            src={product.image || '/assets/placeholder.jpg'} 
            alt={product.name} 
            style={{ 
              width: '100%', 
              flex: 1, // THE FIX: Forces the image to grow and fill the vertical space
              height: '100%', 
              maxHeight: '600px', // THE FIX: Removed the restrictive 'vh' clamp
              objectFit: 'cover', 
              borderRadius: '8px', 
              opacity: isVisualGrayOut ? 0.5 : 1,
              filter: isVisualGrayOut ? 'grayscale(100%)' : 'none',
              transition: 'all 0.3s'
            }} 
          />
        </div>

        {/* RIGHT COLUMN: Details */}
        <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#666', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 'bold' }}>
              {product.brand} | {product.category}
            </span>
            {product.strainType && (
              <span style={{ background: strain.bg, border: `1px solid ${strain.border}`, color: strain.text, padding: '2px 8px', borderRadius: '15px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {product.strainType}
              </span>
            )}
          </div>

          <h1 style={{ margin: '0 0 10px 0', fontSize: 'clamp(1.3rem, 4.5vw, 2.2rem)', lineHeight: '1.1' }}>{product.name}</h1>
          <h2 style={{ margin: '0 0 15px 0', fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)', color: '#111' }}>
            ${product.price ? (product.price / 100).toFixed(2) : '0.00'}
          </h2>

          <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #eee' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: 'clamp(0.85rem, 2vw, 1rem)', lineHeight: '1.4', color: '#444' }}>
              {product.description}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
              <div>
                <span style={{ color: '#666', fontSize: '0.75rem', display: 'block' }}>THC Content</span>
                <strong style={{ fontSize: '0.95rem' }}>{product.thcContent}%</strong>
              </div>
              {product.weightInOunces > 0 && (
                <div>
                  <span style={{ color: '#666', fontSize: '0.75rem', display: 'block' }}>Weight</span>
                  <strong style={{ fontSize: '0.95rem' }}>{product.weightInOunces} oz</strong>
                </div>
              )}
            </div>
          </div>
          
          {/* CART ENGINE */}
          {isDbOutOfStock ? (
            <div style={{ padding: '12px', background: '#f5f5f5', border: '2px dashed #ccc', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: '#666', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>Temporarily out of stock!</p>
            </div>
          ) : availableStock > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: '1 1 70px' }}>
                <label htmlFor="qty" style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666' }}>Quantity</label>
                <select 
                  id="qty"
                  value={qty} 
                  onChange={(e) => setQty(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '2px solid #ccc', fontSize: '1rem', background: 'white', cursor: 'pointer', height: '100%' }}
                >
                  {[...Array(availableStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={addToCartHandler}
                style={{ flex: '3 1 150px', padding: '12px 15px', background: 'black', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', alignSelf: 'flex-end' }}
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

        </div>
      </div>
    </div>
  );
};

export default ProductScreen;