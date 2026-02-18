import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../axios';
import Loader from '../components/Loader';
import DeliveryChecker from '../components/DeliveryChecker';

const HomeScreen = () => {
  const location = useLocation();
  const message = location.state?.message;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quick-Pill Category State
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  // Derived Data for UI
  const limitedReleaseProducts = products.filter((p) => p.isLimitedRelease);
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter((p) => p.category === selectedCategory);

  // Helper for Strain Colors
  const getStrainColor = (strainType) => {
    if (strainType === 'Sativa') return { bg: '#fff7e6', border: '#ffd591', text: '#d46b08' }; 
    if (strainType === 'Indica') return { bg: '#f3e8ff', border: '#d8b4fe', text: '#7e22ce' }; 
    return { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' }; 
  };

  // REMOVED 'Merch' from the categories array
  const categories = ['All', 'Flower', 'Vape', 'Edible', 'Concentrate', 'Pre-Roll', 'Tincture', 'Accessory'];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Security/Action Banners */}
      {message && (
        <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', color: '#ff4d4f', padding: '12px', textAlign: 'center', marginBottom: '20px', borderRadius: '4px', fontWeight: 'bold' }}>
          ⚠️ {message}
        </div>
      )}

      {/* Geofencing Radius Checker */}
      <DeliveryChecker />

      {/* HEADER WITH NEW MERCH BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '25px' }}>
        <div><a 
          href="https://NorthernLegacyMerch.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #434343 100%)', 
            color: 'white', textDecoration: 'none', borderRadius: '30px', 
            fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          👕 Shop Official Merch
        </a>
        </div>
        <div style={{textAlign:"center", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
          <h2 style={{ margin:"auto" }}>Northern Legacy Menu</h2>
          <span style={{ fontSize: '0.85rem', color: '#999' }}>**Development Mode**</span>
        </div>
        {/* NEW: Dedicated External Merch Button */}
      </div>

      {/* 1. LIMITED RELEASE CAROUSEL */}
      {limitedReleaseProducts.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#e0282e' }}>🔥 Exclusive & Limited Release</h2>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px', scrollSnapType: 'x mandatory' }}>
            {limitedReleaseProducts.map((product) => (
              <div key={`limited-${product._id}`} style={{ minWidth: '280px', border: '2px solid #e0282e', borderRadius: '8px', padding: '15px', position: 'relative', scrollSnapAlign: 'start', background: '#fff' }}>
                <span style={{ position: 'absolute', top: '-12px', left: '15px', background: '#e0282e', color: 'white', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px' }}>Limited Drop</span>
                
                {/* INJECTED IMAGE */}
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                
                <h3 style={{ marginTop: '10px' }}>{product.name}</h3>
                <p style={{ margin: '5px 0' }}><strong>Brand:</strong> {product.brand}</p>
                <p style={{ margin: '5px 0' }}><strong>THC:</strong> {product.thcContent}%</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${(product.price / 100).toFixed(2)}</span>
                  <Link to={`/product/${product._id}`} style={{ padding: '8px 15px', background: 'black', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9rem' }}>View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CATEGORY QUICK-PILLS */}
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
      </div>

      {/* MAIN PRODUCT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px', marginTop: '10px' }}>
        {filteredProducts.map((product) => {
          const strain = getStrainColor(product.strainType);
          
          // Add Out of Stock variable here
          const isOutOfStock = product.stockQuantity === 0;
          const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

          return (
            <div key={product._id} style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '12px', position: 'relative', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', opacity: isOutOfStock ? 0.7 : 1 }}>
              
              {/* OUT OF STOCK TAG */}
              {isOutOfStock && (
                <span style={{ position: 'absolute', top: '15px', right: '-10px', background: '#555', color: 'white', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Out of Stock
                </span>
              )}

              {/* ALMOST GONE TAG */}
              {isLowStock && (
                <span style={{ position: 'absolute', top: '15px', right: '-10px', background: '#ff4d4f', color: 'white', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Almost Gone! ({product.stockQuantity} left)
                </span>
              )}
              {/* STRAIN BADGE */}
              {product.strainType && (
                <span style={{ display: 'inline-block', background: strain.bg, border: `1px solid ${strain.border}`, color: strain.text, padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                  {product.strainType}
                </span>
              )}

              {/* INJECTED IMAGE */}
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />

              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{product.name}</h3>
              <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem' }}>{product.brand} | {product.category}</p>
              <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', color: '#333' }}>THC: {product.thcContent}%</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${(product.price / 100).toFixed(2)}</span>
                <Link 
                  to={`/product/${product._id}`} 
                  style={{ display: 'inline-block', padding: '8px 16px', background: '#f5f5f5', color: 'black', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', transition: 'background 0.2s' }}
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
  );
};

export default HomeScreen;