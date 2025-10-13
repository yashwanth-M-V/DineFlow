import React, { useState, useEffect } from 'react';
import { ordersAPI, dishesAPI } from '../../services/api';
import MenuList from './menulist';
import OrderItemsList from './orderitemlist';
import BillSummary from './billsummary';
import LoadingSpinner from '../shared/LoadingSpinner';
import './orderscreen.css';

const OrderScreen = ({ orderId, table, onBack }) => {
  const [order, setOrder] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      
      // Fetch order details and menu in parallel
      const [orderResponse, dishesResponse] = await Promise.all([
        ordersAPI.getById(orderId),
        dishesAPI.getAll()
      ]);

      setOrder(orderResponse.data.data);
      setDishes(dishesResponse.data.data);
      
    } catch (err) {
      console.error('Error fetching order data:', err);
      setError('Failed to load order data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      setActionLoading(true);
      
      const response = await ordersAPI.addItem(orderId, itemData);
      
      // Refresh order data to get updated items and total
      await fetchOrderData();
      
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item to order. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setActionLoading(true);
      
      // For now, we'll just refetch and let the user know this feature is coming
      // In a real app, we'd have a DELETE endpoint
      setError('Remove feature coming soon! For now, please cancel and recreate order if needed.');
      
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async (status) => {
    try {
      setActionLoading(true);
      
      await ordersAPI.updateStatus(orderId, status);
      
      // Go back to table view
      onBack();
      
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to process checkout. Please try again.');
      setActionLoading(false);
    }
  };

  // PRINT FUNCTIONALITY - Add this function
  const handlePrintOrder = () => {
    if (!order || !order.items || order.items.length === 0) {
      setError('No items to print!');
      return;
    }

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kitchen Order - ${table?.name}</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 18px;
            line-height: 1.4;
            margin: 20px;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .order-info { 
            margin: 10px 0; 
            font-weight: bold;
          }
          .item { 
            margin: 8px 0; 
            padding: 5px 0;
            border-bottom: 1px dashed #ccc;
          }
          .instructions { 
            font-style: italic; 
            color: #666;
            margin-left: 10px;
          }
          .timestamp { 
            text-align: center; 
            margin-top: 20px;
            font-size: 14px;
          }
          .no-print {
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KITCHEN ORDER</h1>
          <div class="order-info">
            Table: ${table?.name} | Order: #${orderId}
          </div>
        </div>
        
        ${order.items.map(item => `
          <div class="item">
            <strong>${item.quantity}x ${item.dish_name}</strong>
            ${item.special_instructions ? `<div class="instructions">⚡ ${item.special_instructions}</div>` : ''}
          </div>
        `).join('')}
        
        <div class="timestamp">
          Printed: ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      // Close window after printing
      printWindow.onafterprint = () => printWindow.close();
    }, 250);
  };

  const refreshOrder = () => {
    setError(null);
    fetchOrderData();
  };

  if (loading) {
    return (
      <div className="order-screen">
        <button onClick={onBack} className="back-button">
          ← Back to Tables
        </button>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="order-screen">
      {/* Header */}
      <div className="order-header">
        <button onClick={onBack} className="back-button">
          ← Back to Tables
        </button>
        
        <div className="order-info">
          <h1>{table?.name} - Order #{orderId}</h1>
          <div className="order-meta">
            <span className={`status-badge ${order?.status}`}>
              {order?.status?.toUpperCase()}
            </span>
            <span className="item-count">
              {order?.items?.length || 0} items
            </span>
            <span className="order-total">
              Total: ${order?.total_amount || '0.00'}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button 
            onClick={handlePrintOrder} 
            className="print-button" 
            disabled={!order?.items?.length}
            title="Print to Kitchen"
          >
            🖨️ Print
          </button>
          
          <button 
            onClick={refreshOrder} 
            className="refresh-button" 
            disabled={actionLoading}
            title="Refresh Order"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Loading Overlay */}
      {actionLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner-small"></div>
          <span>Processing...</span>
        </div>
      )}

      {/* Main Content */}
      <div className="order-content">
        {/* Left Column - Menu */}
        <div className="menu-column">
          <MenuList 
            dishes={dishes}
            onAddItem={handleAddItem}
            loading={loading}
          />
        </div>

        {/* Right Column - Order & Bill */}
        <div className="order-column">
          <OrderItemsList 
            items={order?.items || []}
            onRemoveItem={handleRemoveItem}
          />
          
          <BillSummary 
            order={order}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;