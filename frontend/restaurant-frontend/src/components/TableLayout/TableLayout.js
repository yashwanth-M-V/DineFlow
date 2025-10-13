import React, { useState, useEffect } from 'react';
import { ordersAPI, employeesAPI } from '../../services/api';
import TableCard from './TableCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import './TableLayout.css';

const TableLayout = ({ onTableSelect }) => {
  const [tables, setTables] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define restaurant tables
  const restaurantTables = [
    { id: 1, name: 'Table 1', type: 'dine-in' },
    { id: 2, name: 'Table 2', type: 'dine-in' },
    { id: 3, name: 'Table 3', type: 'dine-in' },
    { id: 4, name: 'Table 4', type: 'dine-in' },
    { id: 5, name: 'Table 5', type: 'dine-in' },
    { id: 6, name: 'Table 6', type: 'dine-in' },
    { id: 7, name: 'Table 7', type: 'dine-in' },
    { id: 8, name: 'Table 8', type: 'dine-in' },
    { id: 9, name: 'Takeaway', type: 'takeaway' },
    { id: 10, name: 'Delivery', type: 'delivery' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch active orders and employees in parallel
      const [ordersResponse, employeesResponse] = await Promise.all([
        ordersAPI.getAll('open'),
        employeesAPI.getAll()
      ]);

      setActiveOrders(ordersResponse.data.data || []);
      setEmployees(employeesResponse.data.data || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load table data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = async (table) => {
    try {
      // Check if table already has an active order
      const existingOrder = activeOrders.find(
        order => order.table_number === table.name
      );

      if (existingOrder) {
        // Table has existing order - navigate to order screen
        if (onTableSelect) {
          onTableSelect(existingOrder.order_id, table);
        }
      } else {
        // Create new order for this table
        const firstEmployee = employees[0]; // Default to first available employee
        
        const orderData = {
          table_number: table.name,
          order_type: table.type,
          served_by: firstEmployee ? firstEmployee.employee_id : 1
        };

        const response = await ordersAPI.create(orderData);
        const newOrder = response.data.data;

        // Update local state
        setActiveOrders(prev => [...prev, newOrder]);

        // Navigate to order screen
        if (onTableSelect) {
          onTableSelect(newOrder.order_id, table);
        }
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    }
  };

  const getOrderForTable = (tableName) => {
    return activeOrders.find(order => order.table_number === tableName);
  };

  const refreshTables = () => {
    setError(null);
    fetchInitialData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="table-layout">
      <div className="table-layout-header">
        <h1>Restaurant Tables</h1>
        <button className="refresh-btn" onClick={refreshTables}>
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="tables-grid">
        {restaurantTables.map(table => {
          const order = getOrderForTable(table.name);
          const isOccupied = !!order;
          
          return (
            <TableCard
              key={table.id}
              table={table}
              isOccupied={isOccupied}
              orderTotal={order ? parseFloat(order.total_amount || 0).toFixed(2) : '0.00'}
              itemCount={order ? (order.item_count || 0) : 0}
              onClick={() => handleTableClick(table)}
            />
          );
        })}
      </div>

      <div className="table-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color occupied"></div>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
};

export default TableLayout;