import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import Loader from '../components/Loader';
import QRCode from 'react-qr-code';

const OrderConfirmationScreen = () => {
  const { id: orderId } = useParams(); 
  
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

  // THE FIX: Cleanly referencing the strict Mongoose keys
  const orderItems = order.items || [];
  const isDelivery = order.orderType === 'Land Delivery' || order.orderType === 'Water Delivery';
  const isPickup = order.orderType === 'In-Store Pickup';

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <h1 style={{ textAlign: "center", borderBottom: '1px solid #5d5a5a', paddingBottom: '10px', marginBottom: "30px", textDecoration: 'none', fontStyle: 'normal' }}>
        Order Confirmation
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* LEFT COLUMN: Details & Fulfillment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* SECTION 1: ORDER DETAILS */}
          <div style={{ border: '1px solid #eaeaea', padding: '25px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Details</h2>
            
            <p style={{ margin: '5px 0 25px 0', fontSize: '1.05rem' }}>
              <strong>Payment Method: </strong> {order.paymentMethod}
            </p>

            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#444' }}>Items Purchased:</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
              {orderItems.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic' }}>No items found for this order.</p>
              ) : (
                orderItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #eee', paddingBottom: '12px' }}>
                    <Link to={`/product/${item.productId}`} style={{ textDecoration: 'none', color: '#1890ff', fontWeight: 'bold', flex: 1, paddingRight: '15px' }}>
                      {item.name}
                    </Link>
                    <span style={{ color: '#555', whiteSpace: 'nowrap' }}>
                      {item.quantity} x ${(item.priceAtPurchase / 100).toFixed(2)} = <strong style={{ color: '#111', marginLeft: '5px' }}>${((item.quantity * item.priceAtPurchase) / 100).toFixed(2)}</strong>
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f0f0f0', paddingTop: '15px', fontWeight: 'bold', fontSize: '1.25rem', color: '#111' }}>
              <span>Total {order.paymentMethod === 'Pay In-Store' ? 'Due' : 'Paid'}:</span>
              <span>${(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* SECTION 2: FULFILLMENT */}
          <div style={{ border: '1px solid #eaeaea', padding: '25px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Fulfillment</h2>
            
            <p style={{ margin: '8px 0', fontSize: '1.05rem' }}>
              <strong>Name: </strong> {order.customerId?.firstName} {order.customerId?.lastName}
            </p>
            <p style={{ margin: '8px 0', fontSize: '1.05rem' }}>
              <strong>Order Type: </strong> {order.orderType}
            </p>
            <p style={{ margin: '8px 0', fontSize: '1.05rem' }}>
              <strong>Address: </strong> 
              {isPickup 
                ? 'Northern Legacy Store' 
                : `${order.shippingAddress?.address}, ${order.shippingAddress?.city} ${order.shippingAddress?.postalCode}`
              }
            </p>

            {isDelivery && (
              <p style={{ margin: '8px 0', color: '#1890ff', fontWeight: 'bold', fontSize: '1.05rem' }}>
                <strong>Delivery Window: </strong> Afternoon (12:00 PM - 4:00 PM)
              </p>
            )}

            <p style={{ margin: '8px 0', fontSize: '1.05rem' }}>
              <strong>Status: </strong> <span style={{ color: order.status === 'Completed' ? '#28a745' : '#111', fontWeight: 'bold' }}>{order.status}</span>
            </p>

            {/* CONDITIONAL DISCLAIMERS */}
            {order.paymentMethod === 'Pay In-Store' && (
              <div style={{ marginTop: '20px', padding: '15px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#d48806', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  <strong>⚠️ Important:</strong> Your order will be held until close of business the following day. If it is not picked up and paid for by then, the order will be automatically canceled.
                </p>
              </div>
            )}
            
            {isDelivery && (
              <div style={{ marginTop: '20px', padding: '15px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#096dd9', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  <strong>🚚 Delivery Notice:</strong> The person ordering must be available during the delivery window, along with their physical ID and the QR code provided. An email providing a more specific delivery window will be sent the night before.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: SECTION 3 - Handoff Token */}
        <div>
          <div style={{ border: '2px dashed #ccc', padding: '35px 25px', borderRadius: '12px', background: '#fafafa', textAlign: 'center', position: 'sticky', top: '20px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', color: '#111', fontSize: '1.6rem' }}>
              {isPickup ? 'Pickup Token' : 'Delivery Token'}
            </h2>
            <p style={{ color: '#666', fontSize: '1rem', marginBottom: '30px', lineHeight: '1.5' }}>
              You must present this QR code and your physical ID to the {isPickup ? 'budtender' : 'driver'} to release your inventory.
            </p>
            
            <div style={{ background: 'white', padding: '20px', display: 'inline-block', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              <QRCode value={order.handoffToken || order._id} size={220} />
            </div>
            
            <p style={{ marginTop: '25px', fontFamily: 'monospace', fontSize: '1.4rem', letterSpacing: '4px', color: '#333', fontWeight: 'bold', marginBottom: 0 }}>
              {order.handoffToken ? order.handoffToken : order._id.substring(order._id.length - 8).toUpperCase()}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmationScreen;