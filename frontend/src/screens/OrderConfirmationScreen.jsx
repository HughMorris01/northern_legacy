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

  const orderItems = order.items || [];
  const isDelivery = order.orderType === 'Land Delivery' || order.orderType === 'Water Delivery';
  const isPickup = order.orderType === 'In-Store Pickup';
  const isPrepaid = order.paymentMethod !== 'Pay In-Store';

  // --- DATE & DEADLINE FORMATTERS ---
  const formatNiceDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatDeadline = (dateString, daysToAdd) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + ' at 9:00 PM';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto 40px', padding: '0 15px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <h1 style={{ textAlign: "center", borderBottom: '1px solid #eaeaea', paddingBottom: '15px', marginBottom: "25px", fontSize: '1.8rem' }}>
        Order Confirmation
      </h1>

      {/* THE FIX: CSS injected to handle responsive re-ordering of the QR code */}
      <style>{`
        .confirmation-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .token-col {
          order: -1; /* Rips the QR Code to the VERY TOP on mobile! */
        }
        .info-col {
          order: 1;
        }
        @media (min-width: 768px) {
          .confirmation-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 30px;
            align-items: start;
          }
          .token-col {
            order: 2; /* Puts it back on the right side for desktop */
            position: sticky;
            top: 20px;
          }
        }
      `}</style>

      <div className="confirmation-grid">
        
        {/* LEFT COLUMN: Details & Fulfillment (Rendered second on mobile) */}
        <div className="info-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 1: ORDER DETAILS */}
          <div style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.3rem', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Order Details</h2>
            
            <p style={{ margin: '5px 0', fontSize: '0.95rem', color: '#666' }}>
              <strong>Date Placed: </strong> {formatNiceDate(order.orderPlacedAt || order.createdAt)}
            </p>
            <p style={{ margin: '5px 0 20px 0', fontSize: '0.95rem', color: '#666' }}>
              <strong>Payment Method: </strong> {order.paymentMethod}
            </p>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#111' }}>Items Purchased</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {orderItems.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.95rem' }}>No items found for this order.</p>
              ) : (
                orderItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
                    <Link to={`/product/${item.productId}`} style={{ textDecoration: 'none', color: '#1890ff', fontWeight: 'bold', fontSize: '0.95rem', flex: 1, paddingRight: '15px' }}>
                      {item.name}
                    </Link>
                    <span style={{ color: '#555', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                      {item.quantity} x ${(item.priceAtPurchase / 100).toFixed(2)} = <strong style={{ color: '#111', marginLeft: '5px' }}>${((item.quantity * item.priceAtPurchase) / 100).toFixed(2)}</strong>
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f0f0f0', paddingTop: '15px', fontWeight: 'bold', fontSize: '1.2rem', color: '#111' }}>
              <span>Total {order.paymentMethod === 'Pay In-Store' ? 'Due' : 'Paid'}:</span>
              <span>${(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* SECTION 2: FULFILLMENT */}
          <div style={{ border: '1px solid #eaeaea', padding: '20px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.3rem', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Fulfillment</h2>
            
            <p style={{ margin: '8px 0', fontSize: '0.95rem' }}>
              <strong>Name: </strong> {order.customerId?.firstName} {order.customerId?.lastName}
            </p>
            <p style={{ margin: '8px 0', fontSize: '0.95rem' }}>
              <strong>Order Type: </strong> {order.orderType}
            </p>
            <p style={{ margin: '8px 0', fontSize: '0.95rem' }}>
              <strong>Address: </strong> 
              {isPickup 
                ? 'Northern Legacy Store' 
                : `${order.shippingAddress?.address}, ${order.shippingAddress?.city} ${order.shippingAddress?.postalCode}`
              }
            </p>

            {/* THE FIX: Replaced the hardcoded text with the dynamic database payload! */}
            {isDelivery && order.shippingAddress?.deliveryDate && (
              <p style={{ margin: '8px 0', color: '#1890ff', fontWeight: 'bold', fontSize: '0.95rem' }}>
                Delivery Window: {order.shippingAddress.deliveryTimeSlot} on {order.shippingAddress.deliveryDate}
              </p>
            )}

            {isPickup && !isPrepaid && (
              <p style={{ margin: '8px 0', color: '#d48806', fontWeight: 'bold', fontSize: '0.95rem' }}>
                Pickup Deadline: {formatDeadline(order.orderPlacedAt || order.createdAt, 1)}
              </p>
            )}
            {isPickup && isPrepaid && (
              <p style={{ margin: '8px 0', color: '#d48806', fontWeight: 'bold', fontSize: '0.95rem' }}>
                Pickup Deadline: {formatDeadline(order.orderPlacedAt || order.createdAt, 7)}
              </p>
            )}

            <p style={{ margin: '8px 0', fontSize: '0.95rem' }}>
              <strong>Status: </strong> <span style={{ color: order.status === 'Completed' ? '#28a745' : '#111', fontWeight: 'bold' }}>{order.status}</span>
            </p>

            {isPickup && !isPrepaid && (
              <div style={{ marginTop: '15px', padding: '12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#d48806', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <strong>⚠️ Important:</strong> Your order will be held until 9:00 PM tomorrow. If it is not picked up and paid for by the deadline, the order will be automatically canceled.
                </p>
              </div>
            )}

            {isPickup && isPrepaid && (
              <div style={{ marginTop: '15px', padding: '12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#d48806', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <strong>⚠️ Important:</strong> Your prepaid order will be held securely for 7 days. <span style={{ color: '#cf1322' }}>Failure to pick up your order by the deadline will result in order cancellation and a restocking fee penalty.</span>
                </p>
              </div>
            )}
            
            {isDelivery && (
              <div style={{ marginTop: '15px', padding: '12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#096dd9', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <strong>🚚 Delivery Notice:</strong> The person ordering must be available during the delivery window, along with their physical ID and the QR code provided. An email providing a more specific delivery window will be sent the night before. <span style={{ color: '#cf1322', fontWeight: 'bold' }}>Failure to complete the handoff will result in a restocking fee penalty.</span>
                </p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: SECTION 3 - Handoff Token (Rendered FIRST on mobile) */}
        <div className="token-col">
          <div style={{ border: '2px dashed #ccc', padding: '25px 20px', borderRadius: '12px', background: '#fafafa', textAlign: 'center' }}>
            <h2 style={{ marginTop: 0, marginBottom: '10px', color: '#111', fontSize: '1.4rem' }}>
              {isPickup ? 'Pickup Token' : 'Delivery Token'}
            </h2>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.4' }}>
              You must present this QR code and your physical ID to the {isPickup ? 'budtender' : 'driver'} to release your inventory.
            </p>
            
            <div style={{ background: 'white', padding: '15px', display: 'inline-block', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              <QRCode value={order.handoffToken || order._id} size={200} />
            </div>
            
            <p style={{ marginTop: '20px', fontFamily: 'monospace', fontSize: '1.3rem', letterSpacing: '4px', color: '#333', fontWeight: 'bold', marginBottom: 0 }}>
              {order.handoffToken ? order.handoffToken : order._id.substring(order._id.length - 8).toUpperCase()}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmationScreen;