import React, { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../../services/api';
import './AnalyticsDashboard.css';
import LoadingSpinner from '../shared/LoadingSpinner';

const AnalyticsDashboard = ({ onBack }) => {
  const [salesData, setSalesData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [topDishes, setTopDishes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orderSummary, setOrderSummary] = useState([]);
  const [employeePerformance, setEmployeePerformance] = useState([]);
  const [paymentData, setPaymentData] = useState([]); // NEW: For payment analytics
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePeriod, setActivePeriod] = useState('daily');

  const fetchAllAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching analytics data...');
      
      // Updated: Added payment analytics to the API calls
      const results = await Promise.allSettled([
        analyticsAPI.getSales(activePeriod),
        analyticsAPI.getProfitMargin(),
        analyticsAPI.getTopDishes(10),
        analyticsAPI.getInventoryStatus(),
        analyticsAPI.getOrderSummary(),
        analyticsAPI.getEmployeePerformance(),
        analyticsAPI.getPaymentAnalytics() // NEW: Fetch payment data
      ]);

      const [
        salesResult,
        profitResult,
        topDishesResult,
        inventoryResult,
        orderSummaryResult,
        employeeResult,
        paymentResult // NEW: Payment data result
      ] = results;

      // Helper function to extract data safely
      const getData = (result, defaultValue = []) => {
        if (result.status === 'fulfilled') {
          const response = result.value;
          return response.data?.data || response.data || response || defaultValue;
        }
        console.error('API call failed:', result.reason);
        return defaultValue;
      };

      setSalesData(getData(salesResult));
      setProfitData(getData(profitResult));
      setTopDishes(getData(topDishesResult));
      setInventory(getData(inventoryResult));
      setOrderSummary(getData(orderSummaryResult));
      setEmployeePerformance(getData(employeeResult));
      setPaymentData(getData(paymentResult)); // NEW: Set payment data

      // Check if all requests failed
      const failedCount = results.filter(result => result.status === 'rejected').length;
      if (failedCount === results.length) {
        setError('Failed to load all analytics data');
      } else if (failedCount > 0) {
        setError(`Partial data loaded (${results.length - failedCount}/${results.length} successful)`);
      }
      
    } catch (err) {
      console.error('Unexpected error in fetchAllAnalytics:', err);
      setError('Failed to load analytics data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [activePeriod]);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const refreshAnalytics = () => {
    setError(null);
    fetchAllAnalytics();
  };

  // UPDATED: Calculations based on new database structure
  const calculateTotalOrders = () => {
  if (!orderSummary || orderSummary.length === 0) return 0;
  return orderSummary.reduce((sum, item) => {
    const val = item.order_count ?? item.total_orders ?? item.totalOrders ?? item['total orders'];
    // convert to number safely
    const n = Number(val);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
};

  const calculateTotalRevenue = () => {
    // Now using calculated_total from customer_orders or final_amount from payments
    if (!orderSummary || orderSummary.length === 0) return 0;
    
    // If orderSummary has calculated_total, use it, otherwise fallback to total_amount
    return orderSummary.reduce((sum, item) => {
      const amount = item.calculated_total || item.total_amount || 0;
      return sum + parseFloat(amount);
    }, 0);
  };

  const calculateAverageOrderValue = () => {
    const totalOrders = calculateTotalOrders();
    const totalRevenue = calculateTotalRevenue();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  // NEW: Payment method breakdown calculations
  const calculatePaymentMethodBreakdown = () => {
    if (!paymentData || paymentData.length === 0) return [];
    
    const methodTotals = {};
    paymentData.forEach(payment => {
      const method = payment.payment_method || 'unknown';
      const amount = parseFloat(payment.final_amount || 0);
      
      if (!methodTotals[method]) {
        methodTotals[method] = { method, total: 0, count: 0 };
      }
      methodTotals[method].total += amount;
      methodTotals[method].count += 1;
    });
    
    return Object.values(methodTotals);
  };

  // NEW: Calculate total collected revenue (from payments table)
  const calculateTotalCollectedRevenue = () => {
    if (!paymentData || paymentData.length === 0) return 0;
    return paymentData.reduce((sum, payment) => {
      return sum + parseFloat(payment.final_amount || 0);
    }, 0);
  };


  const getLowStockCount = () => {
    return inventory.filter(item => item.stock_status === 'LOW').length;
  };

  const getStockStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'LOW': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'HIGH': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#3498db';
      case 'in-progress': return '#f39c12';
      case 'closed': return '#27ae60';
      case 'paid': return '#27ae60'; // NEW: Added paid status
      default: return '#95a5a6';
    }
  };

  // NEW: Get color for payment methods
  const getPaymentMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash': return '#27ae60';
      case 'card': return '#3498db';
      case 'digital_wallet': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-header">
          <button onClick={onBack} className="back-button">
            ← Back to Home
          </button>
          <h1>📊 Restaurant Analytics</h1>
          <p>Loading real-time business intelligence...</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate derived data
  const paymentBreakdown = calculatePaymentMethodBreakdown();
  const totalCollected = calculateTotalCollectedRevenue();


  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <button onClick={onBack} className="back-button">
          ← Back to Home
        </button>
        <div className="header-content">
          <div>
            <h1>📊 Restaurant Analytics</h1>
            <p>Real-time business intelligence and performance metrics</p>
          </div>
          <button onClick={refreshAnalytics} className="refresh-button">
            🔄 Refresh Data
          </button>
        </div>
        
        {/* Period Selector */}
        <div className="period-selector">
          <button 
            className={activePeriod === 'daily' ? 'active' : ''}
            onClick={() => setActivePeriod('daily')}
          >
            Daily
          </button>
          <button 
            className={activePeriod === 'weekly' ? 'active' : ''}
            onClick={() => setActivePeriod('weekly')}
          >
            Weekly
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

      {/* Quick Stats - UPDATED with new metrics */}
      <div className="quick-stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{calculateTotalOrders()}</p>
          <p className="stat-label">In count</p>
        </div>
        <div className="stat-card">
          <h3>Order Revenue</h3>
          <p className="stat-number">
            £{calculateTotalRevenue().toFixed(2)}
          </p>
          <p className="stat-label">Order Totals</p>
        </div>
        <div className="stat-card">
          <h3>Collected Revenue</h3>
          <p className="stat-number">
            £{totalCollected.toFixed(2)}
          </p>
          <p className="stat-label">Actual Payments</p>
        </div>
        
        
        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <p className="stat-number">{getLowStockCount()}</p>
          <p className="stat-label">Need Reordering</p>
        </div>
      </div>

      {/* Main Analytics Grid - UPDATED with payment analytics */}
      <div className="analytics-grid">
        {/* Sales Analytics */}
        <div className="analytics-card large">
          <h3>📈 Sales Performance ({activePeriod})</h3>
          <div className="sales-list">
            {salesData && salesData.length > 0 ? (
              salesData.map((sale, index) => (
                <div key={index} className="sales-item">
                  <div className="sales-date">
                    {activePeriod === 'daily' 
                      ? new Date(sale.date).toLocaleDateString()
                      : `Week of ${new Date(sale.week_start).toLocaleDateString()}`
                    }
                  </div>
                  <div className="sales-details">
                    <span>{sale.order_count || 0} orders</span>
                    <span className="revenue">
                      ${parseFloat(sale.calculated_total || sale.total_revenue || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No sales data available</p>
            )}
          </div>
        </div>

        {/* NEW: Payment Method Breakdown */}
        {/*
            <div className="analytics-card">
          <h3>💳 Payment Methods</h3>
          <div className="payment-list">
            {paymentBreakdown && paymentBreakdown.length > 0 ? (
              paymentBreakdown.map((method, index) => (
                <div key={index} className="payment-item">
                  <div 
                    className="payment-method-indicator"
                    style={{ backgroundColor: getPaymentMethodColor(method.method) }}
                  ></div>
                  <div className="payment-info">
                    <div className="payment-method">
                      {method.method?.toUpperCase() || 'UNKNOWN'}
                    </div>
                    <div className="payment-count">
                      {method.count} transactions
                    </div>
                  </div>
                  <div className="payment-amount">
                    ${method.total.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No payment data available</p>
            )}
          </div>
        </div>
        */}

        {/* Profit Margins */}
        <div className="analytics-card">
          <h3>💰 Top Profit Margins</h3>
          <div className="profit-list">
            {profitData && profitData.length > 0 ? (
              profitData.slice(0, 5).map((dish, index) => (
                <div key={dish.dish_id || index} className="profit-item">
                  <div className="dish-name">{dish.dish_name || 'Unknown Dish'}</div>
                  <div className="profit-details">
                    <span className="margin">{dish.profit_margin_percent || 0}%</span>
                    <span className="profit">+${parseFloat(dish.profit_per_unit || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No profit data available</p>
            )}
          </div>
        </div>

        {/* Top Dishes */}
        <div className="analytics-card">
          <h3>🏆 Top Selling Dishes</h3>
          <div className="top-dishes-list">
            {topDishes && topDishes.length > 0 ? (
              topDishes.slice(0, 5).map((dish, index) => (
                <div key={dish.dish_id || index} className="dish-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="dish-info">
                    <div className="dish-name">{dish.dish_name || 'Unknown Dish'}</div>
                    <div className="dish-stats">
                      {dish.total_quantity || 0} sold • ${parseFloat(dish.total_revenue || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No dish data available</p>
            )}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="analytics-card">
          <h3>📦 Inventory Status</h3>
          <div className="inventory-list">
            {inventory && inventory.length > 0 ? (
              inventory.slice(0, 6).map((item, index) => (
                <div key={item.raw_material_id || index} className="inventory-item">
                  <div className="item-name">{item.name || 'Unknown Item'}</div>
                  <div className="item-details">
                    <span 
                      className="stock-status"
                      style={{ color: getStockStatusColor(item.stock_status) }}
                    >
                      {item.current_stock || 0} {item.unit_of_measurement || 'units'}
                    </span>
                    <span className="stock-level">{item.stock_status || 'UNKNOWN'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No inventory data available</p>
            )}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="analytics-card">
          <h3>📋 Order Status</h3>
          <div className="order-status-list">
            {orderSummary && orderSummary.length > 0 ? (
              orderSummary.map((status, index) => (
                <div key={status.status || index} className="status-item">
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(status.status) }}
                  ></div>
                  <div className="status-info">
                    <div className="status-name">{status.status || 'Unknown'}</div>
                    <div className="status-count">{status.order_count || 0} orders</div>
                  </div>
                  <div className="status-amount">
                    ${parseFloat(status.calculated_total || status.total_amount || 0).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No order summary available</p>
            )}
          </div>
        </div>

        {/* Employee Performance */}
        <div className="analytics-card large">
          <h3>⭐ Employee Performance</h3>
          <div className="employee-list">
            {employeePerformance && employeePerformance.length > 0 ? (
              employeePerformance.slice(0, 5).map((employee, index) => (
                <div key={employee.employee_id || index} className="employee-item">
                  <div className="employee-info">
                    <div className="employee-name">
                      {employee.first_name || ''} {employee.last_name || ''}
                    </div>
                    <div className="employee-role">{employee.role || 'Unknown Role'}</div>
                  </div>
                  <div className="employee-stats">
                    <div className="stat">
                      <span className="label">Orders:</span>
                      <span className="value">{employee.orders_served || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Sales:</span>
                      <span className="value">
                        ${parseFloat(employee.total_sales || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="label">Avg:</span>
                      <span className="value">
                        ${parseFloat(employee.avg_order_value || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No employee data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;