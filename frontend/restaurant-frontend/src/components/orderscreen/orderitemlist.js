import React from 'react';
import './orderscreen.css';

const OrderItemsList = ({ items, onRemoveItem }) => {
  if (!items || items.length === 0) {
    return (
      <div className="order-items-empty">
        <p>No items added yet</p>
        <span>Add items from the menu to start the order</span>
      </div>
    );
  }

  return (
    <div className="order-items-list">
      <h3>Order Items</h3>
      
      <div className="items-container">
        {items.map((item) => (
          <div key={item.order_item_id} className="order-item">
            <div className="item-info">
              <span className="item-name">{item.dish_name}</span>
              {item.special_instructions && (
                <span className="special-instructions">
                  Note: {item.special_instructions}
                </span>
              )}
            </div>
            
            <div className="item-details">
              <span className="quantity">Qty: {item.quantity}</span>
              <span className="price">
                ${(item.quantity * parseFloat(item.unit_price_at_time)).toFixed(2)}
              </span>
            </div>
            
            <button 
              className="remove-btn"
              onClick={() => onRemoveItem(item.order_item_id)}
              title="Remove item"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItemsList;