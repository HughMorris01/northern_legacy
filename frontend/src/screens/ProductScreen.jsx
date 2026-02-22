import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import '../styles/ProductScreen.css'; 

const CONCENTRATE_CATEGORIES = ['Concentrate', 'Vape', 'Edible', 'Tincture'];

const getConcentrateGrams = (item) => {
  if (item.concentrateGrams) return item.concentrateGrams;
  if (item.weightInOunces > 0) return Number((item.weightInOunces * 28.3495).toFixed(2));
  if (item.category === 'Edible' || item.category === 'Tincture') return 1.0; 
  return 0;
};

const getFractionalDisplay = (item) => {
  if (CONCENTRATE_CATEGORIES.includes(item.category)) {
    const grams = getConcentrateGrams(item);
    if (grams === 0) return '';
    if (Math.abs(grams - 1.0) < 0.05) return '1g eq.';
    if (Math.abs(grams - 0.5) < 0.05) return '0.5g eq.';
    if (Math.abs(grams - 1.75) < 0.05) return '1.75g eq.';
    return `${grams}g eq.`;
  }

  const decimalOz = item.weightInOunces;
  if (!decimalOz || decimalOz === 0) return '';
  if (Math.abs(decimalOz - 0.125) < 0.001) return '1/8 oz';
  if (Math.abs(decimalOz - 0.25) < 0.001) return '1/4 oz';
  if (Math.abs(decimalOz - 0.5) < 0.001) return '1/2 oz';
  if (Math.abs(decimalOz - 1.0) < 0.001) return '1 oz';
  return `${decimalOz.toFixed(3)} oz`;
};

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

  const getStrainClass = (strainType) => {
    if (strainType === 'Sativa') return 'strain-sativa';
    if (strainType === 'Indica') return 'strain-indica';
    return 'strain-hybrid';
  };

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}><h2>{error}</h2></div>;
  
  const isDbOutOfStock = product.stockQuantity === 0;
  const isCartMaxedOut = product.stockQuantity > 0 && availableStock === 0;
  const isVisualGrayOut = isDbOutOfStock || isCartMaxedOut; 
  const isLowStock = availableStock > 0 && availableStock <= 5;
  const isSpecial = product.isOnSpecial; 

  return (
    <div className="product-screen-container">
      
      <Link to="/" className="back-link">
        &larr; Back to Menu
      </Link>
      
      <div className={`product-card ${isSpecial && !isVisualGrayOut ? 'special-card' : ''}`}>
        
        {isSpecial && !isVisualGrayOut && (
          <span className="badge badge-special">🌟 On Special!</span>
        )}

        {product.isLimitedRelease && !isVisualGrayOut && (
          <span className="badge badge-limited">💎 Limited Drop</span>
        )}

        <div className="image-container">
          {isDbOutOfStock && (
            <span className="badge badge-out">Out of Stock</span>
          )}

          {isCartMaxedOut && !isDbOutOfStock && (
            <span className="badge badge-maxed">Sold Out!</span>
          )}

          {isLowStock && !isDbOutOfStock && !isCartMaxedOut && (
            <span className="badge badge-low">Almost Gone! ({availableStock} left)</span>
          )}

          <img 
            src={product.image || '/assets/placeholder.jpg'} 
            alt={product.name} 
            className={`product-image ${isVisualGrayOut ? 'gray-out' : ''}`}
          />
        </div>

        <div className="details-container">
          
          <div className="product-tags">
            <span className="brand-category">
              {product.brand} | {product.category}
            </span>
            {product.strainType && (
              <span className={`strain-badge ${getStrainClass(product.strainType)}`}>
                {product.strainType}
              </span>
            )}
          </div>

          <h1 className="product-title">{product.name}</h1>
          
          {product.strainLineage && (
            <p className="product-lineage">Lineage: {product.strainLineage}</p>
          )}

          <h2 className={`product-price ${isSpecial && !isVisualGrayOut ? 'special-price' : ''}`}>
            ${product.price ? (product.price / 100).toFixed(2) : '0.00'}
          </h2>

          <div className="product-info-box">
            <p className="product-description">{product.description}</p>
            <div className="product-stats-grid">
              <div>
                <span className="stat-label">THC Content</span>
                <strong className="stat-value">{product.thcContent}%</strong>
              </div>
              
              {getFractionalDisplay(product) && (
                <div>
                  <span className="stat-label">Weight / Eq.</span>
                  <strong className="stat-value">{getFractionalDisplay(product)}</strong>
                </div>
              )}
            </div>
          </div>
          
          <div className="product-actions">
            {isDbOutOfStock ? (
              <div className="out-of-stock-box">
                <p className="out-of-stock-text">Temporarily out of stock!</p>
              </div>
            ) : availableStock > 0 ? (
              <div className="add-to-cart-container">
                <div className="qty-container">
                  <label htmlFor="qty" className="qty-label">Qty</label>
                  <select 
                    id="qty"
                    value={qty} 
                    onChange={(e) => setQty(e.target.value)}
                    className="qty-select"
                  >
                    {[...Array(availableStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>
                </div>
                
                <button onClick={addToCartHandler} className="add-to-cart-btn">
                  Add to Cart
                </button>
              </div>
            ) : (
               <div className="low-stock-warning-box">
                <p className="low-stock-warning-text">Temporarily out of stock!</p>
              </div>
            )}

            {showViewCart && (
              <Link to="/cart" className="view-cart-btn">
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