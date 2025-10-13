const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST create new order (when staff clicks table)
router.post('/', async (req, res) => {
  try {
    const { table_number, order_type = 'dine-in', served_by } = req.body;
    
    const result = await pool.query(`
      INSERT INTO customer_orders (table_number, order_type, served_by) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, [table_number, order_type, served_by]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Order created successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// POST add item to order
router.post('/:orderId/items', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { dish_id, quantity, special_instructions } = req.body;

    // Get current dish price
    const dishResult = await pool.query(
      'SELECT sale_price FROM dishes WHERE dish_id = $1',
      [dish_id]
    );

    if (dishResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dish not found'
      });
    }

    const unit_price_at_time = dishResult.rows[0].sale_price;

    // Add item to order
    const result = await pool.query(`
      INSERT INTO order_items (order_id, dish_id, quantity, unit_price_at_time, special_instructions) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [orderId, dish_id, quantity, unit_price_at_time, special_instructions]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Item added to order successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to order'
    });
  }
});

// GET order details with items
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order header
    const orderResult = await pool.query(`
      SELECT * FROM customer_orders 
      WHERE order_id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Get order items
    const itemsResult = await pool.query(`
      SELECT oi.*, d.name as dish_name, d.description
      FROM order_items oi
      JOIN dishes d ON oi.dish_id = d.dish_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
    `, [orderId]);

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order details'
    });
  }
});

module.exports = router;