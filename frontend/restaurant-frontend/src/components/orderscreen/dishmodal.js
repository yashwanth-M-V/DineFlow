import React, { useState } from 'react';
import './orderscreen.css';

const DishModal = ({ dish, isOpen, onClose, onAddToOrder }) => {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isOpen || !dish) return null;

  const handleAddToOrder = () => {
    onAddToOrder({
      dish_id: dish.dish_id,
      quantity: quantity,
      special_instructions: specialInstructions.trim()
    });
    
    // Reset form
    setQuantity(1);
    setSpecialInstructions('');
    onClose();
  };

  const handleClose = () => {
    setQuantity(1);
    setSpecialInstructions('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="dish-modal">
        <div className="modal-header">
          <h2>{dish.name}</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="dish-details">
            <p className="dish-description">{dish.description}</p>
            <div className="dish-price">${parseFloat(dish.sale_price).toFixed(2)}</div>
          </div>

          <div className="form-group">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Special Instructions:</label>
            <textarea
              placeholder="e.g., No onions, Extra sauce, Well done..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={handleAddToOrder}>
              Add to Order (${(quantity * parseFloat(dish.sale_price)).toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishModal;