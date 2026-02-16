import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import Loader from '../components/Loader';

const OrderScreen = () => {
  const { id: orderId } = useParams(); // Grabs the ID right out of the URL
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${orderId}`);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <Loader />;
  
  if (error) return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', background: '#ff4d4f', color: 'white', padding: '15px', borderRadius: '5px' }}>
      {error}
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ wordWrap: 'break-word' }}>Order: {order._id}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginTop: '30px' }}>
        
        {/* LEFT COLUMN: Order Details */}
        <div>
          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Delivery Details</h2>
            <p><strong>Name: </strong> {order.customerId.firstName} {order.customerId.lastName}</p>
            <p><strong>Email: </strong> {order.customerId.email}</p>
            <p><strong>Terrain: </strong> {order.shippingAddress.terrainType}</p>
            <p>
              <strong>Address: </strong> 
              {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
            </p>
            
            <div style={{ marginTop: '15px', padding: '10px', borderRadius: '5px', background: order.status === 'Completed' ? '#e6ffed' : '#fffbe6', border: `1px solid ${order.status === 'Completed' ? '#34d058' : '#ffe58f'}` }}>
              Order Status: <strong>{order.status}</strong>
            </div>
          </div>

          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Payment</h2>
            <p><strong>Method: </strong> {order.paymentMethod}</p>
          </div>

          <div>
            <h2 style={{ marginBottom: '15px' }}>Items Purchased</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {order.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/product/${item.productId}`} style={{ textDecoration: 'none', color: 'blue', fontWeight: 'bold' }}>
                    {item.name}
                  </Link>
                  <span>
                    {item.quantity} x ${(item.priceAtPurchase / 100).toFixed(2)} = <strong>${((item.quantity * item.priceAtPurchase) / 100).toFixed(2)}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Handoff Token & Summary */}
        <div>
          {/* THE COMPLIANCE HANDOFF TOKEN */}
          {(order.orderType === 'Land Delivery' || order.orderType === 'Water Delivery') && (
            <div style={{ border: '2px dashed #333', padding: '25px', borderRadius: '8px', background: '#f9f9f9', textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Delivery Handoff Token</h2>
              <p style={{ color: 'gray', fontSize: '0.9rem', marginBottom: '20px' }}>
                You must present this token and your physical ID to the driver to release your inventory.
              </p>
              
              <div style={{ background: 'black', color: 'white', padding: '20px', fontSize: '1.2rem', fontFamily: 'monospace', letterSpacing: '2px', borderRadius: '5px' }}>
                {order._id.substring(order._id.length - 8).toUpperCase()}
              </div>
            </div>
          )}

          <div style={{ border: '1px solid #ccc', padding: '25px', borderRadius: '8px', background: '#f9f9f9' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Total Paid:</span>
              <span>${(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderScreen;