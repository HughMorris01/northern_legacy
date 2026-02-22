import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../axios';
import Loader from '../components/Loader';
import DeliveryChecker from '../components/DeliveryChecker';
import useCartStore from '../store/cartStore';
import '../styles/HomeScreen.css'; 

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

// THE FIX: Array of compliance and development warnings
const DISCLAIMERS = [
  "⚠️ App in active development",
  "🚫 Sales are not real (Demo Mode)",
  "📝 Northern Legacy is a license-pending applicant",
  "🧪 Test environment only: No actual inventory"
];

const HomeScreen = () => {
  const location = useLocation();
  const message = location.state?.message;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState('All');

  const cartItems = useCartStore((state) => state.cartItems);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollReqRef = useRef(null);
  const scrollSpeedRef = useRef(2); 

  const sliderRef = useRef(null);
  const isSliderHovered = useRef(false);
  const isManualScrolling = useRef(false); 

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const startScroll = () => {
    scrollSpeedRef.current = 2; 
    const scrollStep = () => {
      if (window.scrollY === 0) {
        stopScroll();
        return;
      }
      window.scrollBy(0, -scrollSpeedRef.current);
      scrollSpeedRef.current *= 1.05; 
      scrollReqRef.current = requestAnimationFrame(scrollStep);
    };
    scrollReqRef.current = requestAnimationFrame(scrollStep);
  };

  const stopScroll = () => {
    if (scrollReqRef.current) {
      cancelAnimationFrame(scrollReqRef.current);
      scrollReqRef.current = null;
    }
  };

  const handleScrollLeft = () => {
    isManualScrolling.current = true;
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
    setTimeout(() => { isManualScrolling.current = false; }, 600); 
  };

  const handleScrollRight = () => {
    isManualScrolling.current = true;
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
    setTimeout(() => { isManualScrolling.current = false; }, 600);
  };

  const specials = products.filter((p) => p.isOnSpecial);
  const limitedReleaseProducts = products.filter((p) => p.isLimitedRelease);
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter((p) => p.category === selectedCategory);

  const infiniteLimitedProducts = [
    ...limitedReleaseProducts, ...limitedReleaseProducts, ...limitedReleaseProducts,
    ...limitedReleaseProducts, ...limitedReleaseProducts, ...limitedReleaseProducts
  ];
  
  const infiniteSpecials = [...specials, ...specials, ...specials, ...specials, ...specials, ...specials];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || limitedReleaseProducts.length === 0) return;

    let animationFrameId;

    const initScroll = setTimeout(() => {
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = sliderRef.current.scrollWidth / 2;
      }
    }, 200);

    const autoScroll = () => {
      if (slider) {
        if (!isSliderHovered.current && !isManualScrolling.current) {
          slider.scrollLeft += 0.8; 
        }
        
        const halfWidth = slider.scrollWidth / 2;
        
        if (slider.scrollLeft >= halfWidth + 500) {
          slider.scrollLeft -= halfWidth;
        } 
        else if (slider.scrollLeft <= 5) {
          slider.scrollLeft += halfWidth;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      clearTimeout(initScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [limitedReleaseProducts.length]);

  const getStrainColor = (strainType) => {
    if (strainType === 'Sativa') return { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' }; 
    if (strainType === 'Indica') return { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce' }; 
    return { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' }; 
  };

  const categories = ['All', 'Flower', 'Vape', 'Edible', 'Concentrate', 'Pre-Roll', 'Tincture', 'Accessory'];

  if (loading) return <Loader />;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}><h2>{error}</h2></div>;

  return (
    <div style={{ width: '100%', overflowX: 'hidden', position: 'relative' }}>
      
      <style>{`
        @keyframes scrollTicker {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .ticker-wrapper:hover .ticker-track {
          animation-play-state: paused;
        }
      `}</style>

      {specials.length > 0 && (
        <div className="ticker-wrapper" style={{ background: '#fffbe6', borderBottom: '1px solid #ffe58f', padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div className="ticker-track" style={{ display: 'inline-flex', animation: 'scrollTicker 110s linear infinite', fontWeight: 'bold', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
            {infiniteSpecials.map((s, idx) => (
              <span key={`ticker-${s._id}-${idx}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Link to={`/product/${s._id}`} className="ticker-link" style={{ color: '#d48806', textDecoration: 'none' }}>
                  🔥 {s.name} on special for ${(s.price/100).toFixed(2)}!
                </Link>
                <span style={{ color: '#ffe58f', margin: '0 20px' }}>|</span>
                
                {/* THE FIX: Injecting the cycling disclaimer array */}
                <span style={{ color: '#cf1322', fontStyle: 'italic', fontWeight: 'bold' }}>
                  {DISCLAIMERS[idx % DISCLAIMERS.length]}
                </span>
                <span style={{ color: '#ffe58f', margin: '0 20px' }}>|</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ width: '100%', padding: '20px 15px 40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {message && (
          <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', color: '#ff4d4f', padding: '12px', textAlign: 'center', marginBottom: '20px', borderRadius: '4px', fontWeight: 'bold' }}>
            ⚠️ {message}
          </div>
        )}

        <DeliveryChecker />

        {limitedReleaseProducts.length > 0 && (
          <div style={{ marginBottom: '30px', marginTop: '15px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#e0282e' }}>💎 Exclusive & Limited Release</h2>
            
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => { isSliderHovered.current = true; }}
              onMouseLeave={() => { isSliderHovered.current = false; }}
              onTouchStart={() => { isSliderHovered.current = true; }}
              onTouchEnd={() => { setTimeout(() => isSliderHovered.current = false, 500); }}
            >
              <button className="slider-arrow left" onClick={handleScrollLeft}>&#8249;</button>
              
              <div ref={sliderRef} className="hide-scrollbar" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingTop: '15px', paddingBottom: '15px', scrollSnapType: 'none', scrollBehavior: 'auto' }}>
                {infiniteLimitedProducts.map((product, index) => {
                  const existItem = cartItems.find((x) => x._id === product._id);
                  const qtyInCart = existItem ? existItem.qty : 0;
                  const availableStock = (product.stockQuantity || 0) - qtyInCart;

                  const isDbOutOfStock = product.stockQuantity === 0;
                  const isCartMaxedOut = product.stockQuantity > 0 && availableStock <= 0;
                  const isVisualGrayOut = isDbOutOfStock || isCartMaxedOut;
                  const isLowStock = availableStock > 0 && availableStock <= 5;
                  const isSpecial = product.isOnSpecial;

                  return (
                    <div key={`limited-${product._id}-${index}`} className={`product-grid-card ${isVisualGrayOut ? 'gray-out' : ''}`} style={{ minWidth: 'clamp(240px, 70vw, 280px)', border: '2px solid #e0282e', borderRadius: '10px', position: 'relative', background: '#fff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', padding: 0 }}>
                      
                      <span style={{ position: 'absolute', top: '-12px', left: '-10px', background: '#e0282e', color: 'white', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                        💎 Limited Drop
                      </span>

                      {isSpecial && !isVisualGrayOut && (
                        <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: '#ffc53d', color: '#111', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                          🌟 On Special!
                        </span>
                      )}

                      <div style={{ position: 'relative' }}>
                        {isDbOutOfStock && (
                          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#555', color: 'white', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            Out of Stock
                          </span>
                        )}

                        {isCartMaxedOut && !isDbOutOfStock && (
                          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#d48806', color: 'white', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            Cart Maxed
                          </span>
                        )}

                        {isLowStock && !isDbOutOfStock && !isCartMaxedOut && (
                          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#ff4d4f', color: 'white', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            Almost Gone! ({availableStock} left)
                          </span>
                        )}
                        
                        <img src={product.image} alt={product.name} className={`product-grid-image ${isVisualGrayOut ? 'gray-out' : ''}`} style={{ width: '100%', height: '180px', objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', marginBottom: 0, display: 'block' }} />
                      </div>
                      
                      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{product.name}</h3>
                          <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.85rem' }}>{product.brand} | {product.category}</p>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>THC: {product.thcContent}%</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#888' }}>
                              {getFractionalDisplay(product)}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '1.15rem' }}>${(product.price / 100).toFixed(2)}</span>
                          <Link to={`/product/${product._id}`} style={{ padding: '8px 15px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold' }}>View</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="slider-arrow right" onClick={handleScrollRight}>&#8250;</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '10px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: '1px solid #ccc',
                background: selectedCategory === cat ? 'black' : 'white',
                color: selectedCategory === cat ? 'white' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
          <Link 
            to="/merch" 
            style={{
                  padding: '8px 20px',
                  borderRadius: '30px',
                  border: '1px solid #ccc',
                  background: 'black',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  textDecoration: 'none'
                }}
          >
            👕 Merch
          </Link>
        </div>

        <div className="product-grid-container">
          {filteredProducts.map((product) => {
            const strain = getStrainColor(product.strainType);
            
            const existItem = cartItems.find((x) => x._id === product._id);
            const qtyInCart = existItem ? existItem.qty : 0;
            const availableStock = (product.stockQuantity || 0) - qtyInCart;

            const isDbOutOfStock = product.stockQuantity === 0;
            const isCartMaxedOut = product.stockQuantity > 0 && availableStock <= 0;
            const isVisualGrayOut = isDbOutOfStock || isCartMaxedOut;
            const isSpecial = product.isOnSpecial; 
            const isLowStock = availableStock > 0 && availableStock <= 5;

            return (
              <div 
                key={product._id} 
                className={`product-grid-card ${isVisualGrayOut ? 'gray-out' : ''}`}
                style={isSpecial && !isVisualGrayOut ? { border: '2px solid #ffc53d', boxShadow: '0 0 12px rgba(255,197,61,0.5)' } : {}}
              >
                
                {isSpecial && !isVisualGrayOut && (
                  <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: '#ffc53d', color: '#111', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    🌟 On Special!
                  </span>
                )}

                {product.isLimitedRelease && !isVisualGrayOut && (
                  <span style={{ position: 'absolute', top: '-10px', left: '-10px', background: '#e0282e', color: 'white', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    💎 Limited Drop
                  </span>
                )}

                <div className="product-image-wrapper">
                  {isDbOutOfStock && (
                    <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#555', color: 'white', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      Out of Stock
                    </span>
                  )}

                  {isCartMaxedOut && !isDbOutOfStock && (
                    <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#d48806', color: 'white', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      Cart Maxed
                    </span>
                  )}

                  {isLowStock && !isDbOutOfStock && !isCartMaxedOut && (
                    <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#ff4d4f', color: 'white', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '6px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      Almost Gone! ({availableStock} left)
                    </span>
                  )}

                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className={`product-grid-image ${isVisualGrayOut ? 'gray-out' : ''}`} 
                  />
                </div>

                {product.strainType && (
                  <span style={{ display: 'inline-block', background: strain.bg, border: `1px solid ${strain.border}`, color: strain.text, padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                    {product.strainType}
                  </span>
                )}

                <h3 className="product-grid-title">{product.name}</h3>
                <p className="product-grid-brand">{product.brand} | {product.category}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p className="product-grid-thc">THC: {product.thcContent}%</p>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#888' }}>
                    {getFractionalDisplay(product)}
                  </p>
                </div>
                
                <div className="product-grid-footer">
                  <span className="product-grid-price" style={{ color: isSpecial && !isVisualGrayOut ? '#d48806' : 'inherit' }}>
                    ${(product.price / 100).toFixed(2)}
                  </span>
                  <Link 
                    to={`/product/${product._id}`} 
                    style={{ display: 'inline-block', padding: '8px 16px', background: isSpecial && !isVisualGrayOut ? '#fffbe6' : '#f5f5f5', color: 'black', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', transition: 'background 0.2s' }}
                  >
                    Details
                  </Link>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <p style={{ color: '#999', gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>No products found in this category.</p>
          )}
        </div>

      </div>

      {showScrollTop && (
        <button
          onMouseDown={startScroll}
          onMouseUp={stopScroll}
          onMouseLeave={stopScroll}
          onTouchStart={startScroll}
          onTouchEnd={stopScroll}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: 'clamp(15px, 4vw, 30px)', 
            width: '60px', 
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            border: 'none',
            fontSize: '2.5rem', 
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            userSelect: 'none',
            WebkitUserSelect: 'none', 
            touchAction: 'none', 
            transition: 'opacity 0.3s',
          }}
        >
          ↑
        </button>
      )}

    </div>
  );
};

export default HomeScreen;