import React from 'react';
import './TableLayout.css';

const TableCard = ({ table, onClick, isOccupied, orderTotal, itemCount }) => {
  const getStatusColor = () => {
    if (isOccupied) return 'occupied';
    return 'available';
  };

  const getStatusText = () => {
    if (isOccupied) return 'Occupied';
    return 'Available';
  };

  return (
    <div 
      className={`table-card ${getStatusColor()}`}
      onClick={onClick}
    >
      <div className="table-header">
        <h3 className="table-name">{table.name}</h3>
        <span className="table-status">{getStatusText()}</span>
      </div>
      
      <div className="table-icon">
        <span className="table-icon-emoji">
          {table.type === 'takeaway' ? '🥡' : '🍽️'}
        </span>
      </div>

      {isOccupied && (
        <div className="table-details">
          <div className="order-info">
            <span className="item-count">{itemCount} items</span>
            <span className="order-total">${orderTotal}</span>
          </div>
        </div>
      )}
      
      {!isOccupied && (
        <div className="table-details">
          <span className="click-hint">Click to start order</span>
        </div>
      )}
    </div>
  );
};

export default TableCard;