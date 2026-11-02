import { useEffect, useState } from 'react';
import { Clock3, PackageCheck, ReceiptText } from 'lucide-react';
import { lmsAPI } from '../api/lms';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      try {
        const response = await lmsAPI.getOrders();
        if (active && response.data?.success) {
          setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        if (active) setHasError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();
    return () => { active = false; };
  }, []);

  return (
    <section className="student-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow eyebrow-muted">Account</span>
          <h1>My orders</h1>
          <p>Review your course purchases and order status.</p>
        </div>
      </header>
      {loading ? (
        <div className="dashboard-panel orders-loading" aria-label="Loading orders">
          {[1, 2, 3].map((row) => <div key={row} className="order-skeleton" />)}
        </div>
      ) : hasError ? (
        <div className="state-card state-error">
          <ReceiptText size={28} />
          <h3>Orders couldn’t be loaded</h3>
          <p>Please try again shortly.</p>
        </div>
      ) : orders.length ? (
        <div className="orders-list">
          {orders.map((order) => {
            const status = order.payment_info?.status || order.status;
            const createdAt = order.createdAt ? new Date(order.createdAt) : null;
            return (
              <article className="order-card" key={order._id}>
                <span className="order-card-icon"><PackageCheck size={19} /></span>
                <div className="order-card-main">
                  <strong>Order {order._id}</strong>
                  <span>{order.course?.name || order.courseId || 'Course purchase'}</span>
                </div>
                <div className="order-card-date">
                  <Clock3 size={15} />
                  <span>{createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleDateString() : 'Date unavailable'}</span>
                </div>
                <span className={`order-status ${status ? `status-${String(status).toLowerCase()}` : ''}`}>
                  {status || 'Status unavailable'}
                </span>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="state-card">
          <ReceiptText size={28} />
          <h3>No orders yet</h3>
          <p>Your course purchases will appear here.</p>
        </div>
      )}
    </section>
  );
};

export default Orders;
