import React from 'react';
import './orderscreen.css';

const BillSummary = ({ order, onCheckout }) => {
  if (!order || !order.items) return null;

  const subtotal = order.items.reduce((total, item) => {
    return total + (item.quantity * parseFloat(item.unit_price_at_time));
  }, 0);

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="bill-summary">
      <h3>Bill Summary</h3>
      
      <div className="bill-details">
        <div className="bill-row">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="bill-row">
          <span>Tax (10%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="bill-row total">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="bill-actions">
        <button 
          className="checkout-btn"
          onClick={() => onCheckout('paid')}
          disabled={order.items.length === 0}
        >
          💳 Checkout & Pay
        </button>
        
        <button 
          className="cancel-btn"
          onClick={() => onCheckout('cancelled')}
        >
          ❌ Cancel Order
        </button>
      </div>
    </div>
  );
};

export default BillSummary;