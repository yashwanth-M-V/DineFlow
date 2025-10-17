const express = require('express');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5050;

console.log('🚀 Starting Restaurant Management System API...');

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// =====================
// HEALTH & TEST ROUTES
// =====================

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Restaurant API Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// =====================
// PHASE 1: BASIC DATA APIs
// =====================

app.get('/api/dishes', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM dishes WHERE is_available = true ORDER BY category, name`);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dishes' });
  }
});

app.get('/api/raw-materials', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM raw_materials ORDER BY name`);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch raw materials' });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM employees WHERE is_active = true ORDER BY first_name, last_name`);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
});

// =====================
// PHASE 2: ORDER MANAGEMENT APIs
// =====================

// CREATE NEW ORDER
app.post('/api/orders', async (req, res) => {
  try {
    const { table_number, order_type = 'dine-in', served_by } = req.body;
    
    console.log('Creating order for table:', table_number);
    
    const result = await pool.query(`
      INSERT INTO customer_orders (table_number, order_type, served_by) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, [table_number, order_type, served_by]);
    
    console.log('Order created:', result.rows[0]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      details: error.message
    });
  }
});


// GET SINGLE ORDER DETAILS
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Fetching order details for ID:', orderId);

    const orderResult = await pool.query(`
      SELECT 
        co.*,
        e.first_name || ' ' || e.last_name as server_name
      FROM customer_orders co
      LEFT JOIN employees e ON co.served_by = e.employee_id
      WHERE co.order_id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const itemsResult = await pool.query(`
      SELECT 
        oi.*,
        d.name as dish_name,
        d.description
      FROM order_items oi
      JOIN dishes d ON oi.dish_id = d.dish_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
    `, [orderId]);

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;
    
    order.total_amount = order.items.reduce((total, item) => {
      return total + (item.quantity * parseFloat(item.unit_price_at_time));
    }, 0);

    console.log(`Order ${orderId} has ${order.items.length} items, total: $${order.total_amount}`);

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details',
      details: error.message
    });
  }
});

// ADD ITEM TO ORDER (FIXED ROUTE)
app.post('/api/orders/:orderId/items', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { dish_id, quantity, special_instructions = '' } = req.body;

    console.log(`Adding item to order ${orderId}:`, { dish_id, quantity, special_instructions });

    // Verify order exists and is open
    const orderCheck = await pool.query(
      'SELECT * FROM customer_orders WHERE order_id = $1',
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (orderCheck.rows[0].status !== 'open') {
      console.log('Order is not open:', orderId);
      return res.status(400).json({
        success: false,
        error: 'Cannot add items to a closed order'
      });
    }

    // Get dish details
    const dishResult = await pool.query(
      'SELECT sale_price, name FROM dishes WHERE dish_id = $1 AND is_available = true',
      [dish_id]
    );

    if (dishResult.rows.length === 0) {
      console.log('Dish not found or unavailable:', dish_id);
      return res.status(404).json({
        success: false,
        error: 'Dish not found or unavailable'
      });
    }

    const unit_price_at_time = dishResult.rows[0].sale_price;
    const dish_name = dishResult.rows[0].name;

    // Add item to order
    const result = await pool.query(`
      INSERT INTO order_items (order_id, dish_id, quantity, unit_price_at_time, special_instructions) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [orderId, dish_id, quantity, unit_price_at_time, special_instructions]);

    console.log('Item added successfully:', result.rows[0]);

    res.status(201).json({
      success: true,
      data: {
        ...result.rows[0],
        dish_name: dish_name
      },
      message: 'Item added to order successfully'
    });
  } catch (error) {
    console.error('Error adding order item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to order',
      details: error.message
    });
  }
});

// UPDATE ORDER STATUS
app.put('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log(`Updating order ${orderId} status to:`, status);

    const validStatuses = ['open', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: open, paid, or cancelled'
      });
    }

    const result = await pool.query(`
      UPDATE customer_orders 
      SET status = $1, updated_at = NOW()
      WHERE order_id = $2 
      RETURNING *
    `, [status, orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    console.log('Order status updated:', result.rows[0]);

    res.json({
      success: true,
      data: result.rows[0],
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      details: error.message
    });
  }
});


// =====================
// NEW: PAYMENT ANALYTICS API
// =====================

// GET - Payment Analytics
app.get('/api/analytics/payments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.payment_id,
        p.order_id,
        p.payment_method,
        p.amount,
        p.tip_amount,
        p.tax_amount,
        p.discount_amount,
        p.final_amount,
        p.status,
        p.payment_date,
        p.transaction_id,
        co.table_number,
        e.first_name || ' ' || e.last_name as processed_by_name
      FROM payments p
      LEFT JOIN customer_orders co ON p.order_id = co.order_id
      LEFT JOIN employees e ON p.processed_by = e.employee_id
      ORDER BY p.payment_date DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment analytics',
      details: error.message
    });
  }
});

// =====================
// UPDATED ANALYTICS APIs (Fix the existing ones)
// =====================

// GET - Sales Analytics (UPDATED)
app.get('/api/analytics/sales', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    
    let query = '';
    if (period === 'daily') {
      query = `
        SELECT 
          DATE(co.created_at) as date,
          COUNT(*) as order_count,
          SUM(co.calculated_total) as total_revenue,
          AVG(co.calculated_total) as avg_order_value
        FROM customer_orders co
        WHERE co.status = 'paid'
        GROUP BY DATE(co.created_at)
        ORDER BY date DESC
        LIMIT 30
      `;
    } else if (period === 'weekly') {
      query = `
        SELECT 
          DATE_TRUNC('week', co.created_at) as week_start,
          COUNT(*) as order_count,
          SUM(co.calculated_total) as total_revenue,
          AVG(co.calculated_total) as avg_order_value
        FROM customer_orders co
        WHERE co.status = 'paid'
        GROUP BY DATE_TRUNC('week', co.created_at)
        ORDER BY week_start DESC
        LIMIT 12
      `;
    }

    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      period: period
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales analytics',
      details: error.message
    });
  }
});

// GET - Order Status Summary (UPDATED)
app.get('/api/analytics/order-summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        status,
        COUNT(*) as order_count,
        SUM(COALESCE(calculated_total, 0)) as total_amount,
        AVG(COALESCE(calculated_total, 0)) as avg_order_value
      FROM customer_orders 
      GROUP BY status
      ORDER BY 
        CASE status 
          WHEN 'open' THEN 1
          WHEN 'in-progress' THEN 2
          WHEN 'paid' THEN 3
          WHEN 'closed' THEN 4
          ELSE 5
        END
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching order summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order summary',
      details: error.message
    });
  }
});

// GET - Employee Performance (UPDATED)
app.get('/api/analytics/employee-performance', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.role,
        COUNT(co.order_id) as orders_served,
        COALESCE(SUM(co.calculated_total), 0) as total_sales,
        COALESCE(AVG(co.calculated_total), 0) as avg_order_value
      FROM employees e
      LEFT JOIN customer_orders co ON e.employee_id = co.served_by
      WHERE co.status = 'paid' OR co.status IS NULL
      GROUP BY e.employee_id, e.first_name, e.last_name, e.role
      ORDER BY total_sales DESC, orders_served DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching employee performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee performance',
      details: error.message
    });
  }
});

// GET - Orders with calculated_total (UPDATED)
app.get('/api/orders', async (req, res) => {
  try {
    const { status = 'open' } = req.query;
    
    console.log('Fetching orders with status:', status);
    
    const result = await pool.query(`
      SELECT 
        co.*,
        e.first_name || ' ' || e.last_name as server_name,
        COUNT(oi.order_item_id) as item_count,
        COALESCE(SUM(oi.quantity * oi.unit_price_at_time), 0) as calculated_amount,
        COALESCE(co.calculated_total, 0) as calculated_total
      FROM customer_orders co
      LEFT JOIN employees e ON co.served_by = e.employee_id
      LEFT JOIN order_items oi ON co.order_id = oi.order_id
      WHERE co.status = $1
      GROUP BY co.order_id, e.first_name, e.last_name
      ORDER BY co.created_at DESC
    `, [status]);
    
    console.log(`Found ${result.rows.length} orders with status '${status}'`);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      details: error.message
    });
  }
});

// GET - Profit Margin Analytics
app.get('/api/analytics/profit-margin', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.dish_id,
        d.name as dish_name,
        d.sale_price,
        COALESCE(SUM(dr.quantity_required * rm.cost_per_unit), 0) as cost_price,
        (d.sale_price - COALESCE(SUM(dr.quantity_required * rm.cost_per_unit), 0)) as profit_per_unit,
        CASE 
          WHEN d.sale_price > 0 THEN 
            ROUND(((d.sale_price - COALESCE(SUM(dr.quantity_required * rm.cost_per_unit), 0)) / d.sale_price * 100)::numeric, 2)
          ELSE 0 
        END as profit_margin_percent
      FROM dishes d
      LEFT JOIN dish_recipes dr ON d.dish_id = dr.dish_id
      LEFT JOIN raw_materials rm ON dr.raw_material_id = rm.raw_material_id
      GROUP BY d.dish_id, d.name, d.sale_price
      ORDER BY profit_margin_percent DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching profit analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profit analytics'
    });
  }
});

// GET - Top Selling Dishes
app.get('/api/analytics/top-dishes', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await pool.query(`
      SELECT 
        d.dish_id,
        d.name as dish_name,
        d.category,
        COUNT(oi.order_item_id) as times_ordered,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi.unit_price_at_time) as total_revenue
      FROM dishes d
      LEFT JOIN order_items oi ON d.dish_id = oi.dish_id
      LEFT JOIN customer_orders co ON oi.order_id = co.order_id
      WHERE co.status = 'paid' OR co.status IS NULL
      GROUP BY d.dish_id, d.name, d.category
      ORDER BY total_quantity DESC, total_revenue DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching top dishes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top dishes'
    });
  }
});

// GET - Inventory Status
app.get('/api/analytics/inventory-status', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        raw_material_id,
        name,
        current_stock,
        alert_threshold,
        cost_per_unit,
        unit_of_measurement,
        CASE 
          WHEN current_stock <= alert_threshold THEN 'LOW'
          WHEN current_stock <= alert_threshold * 1.5 THEN 'MEDIUM'
          ELSE 'HIGH'
        END as stock_status
      FROM raw_materials 
      ORDER BY 
        CASE 
          WHEN current_stock <= alert_threshold THEN 1
          WHEN current_stock <= alert_threshold * 1.5 THEN 2
          ELSE 3
        END,
        current_stock ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching inventory status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory status'
    });
  }
});


// =====================
// ERROR HANDLING
// =====================

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    requested: req.originalUrl,
    availableRoutes: [
      'GET  /api/health',
      'GET  /api/dishes',
      'GET  /api/raw-materials', 
      'GET  /api/employees',
      'POST /api/orders',
      'GET  /api/orders',
      'GET  /api/orders/:orderId',
      'POST /api/orders/:orderId/items',
      'PUT  /api/orders/:orderId/status'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});


// Update the server startup log
app.listen(PORT, () => {
  console.log('✅ Restaurant Management API started successfully!');
  console.log(`📍 Port: ${PORT}`);
  console.log('\n📊 Available Routes:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/dishes');
  console.log('   GET  /api/raw-materials');
  console.log('   GET  /api/employees');
  console.log('   POST /api/orders');
  console.log('   GET  /api/orders');
  console.log('   GET  /api/orders/:orderId');
  console.log('   POST /api/orders/:orderId/items');
  console.log('   PUT  /api/orders/:orderId/status');
  console.log('   GET  /api/analytics/sales');
  console.log('   GET  /api/analytics/profit-margin');
  console.log('   GET  /api/analytics/top-dishes');
  console.log('   GET  /api/analytics/inventory-status');
  console.log('   GET  /api/analytics/order-summary');
  console.log('   GET  /api/analytics/employee-performance');
  console.log('   GET  /api/analytics/payments'); // NEW ENDPOINT
  console.log('\n🔍 Debug mode: ON - all requests will be logged');
});