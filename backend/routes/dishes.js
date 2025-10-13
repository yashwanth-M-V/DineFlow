const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all dishes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM dishes 
      ORDER BY dish_id
    `);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dishes'
    });
  }
});

// GET single dish by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT * FROM dishes 
      WHERE dish_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dish not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dish'
    });
  }
});

// POST create new dish
router.post('/', async (req, res) => {
  try {
    const { name, description, sale_price, category, prep_time } = req.body;
    
    const result = await pool.query(`
      INSERT INTO dishes (name, description, sale_price, category, prep_time) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [name, description, sale_price, category, prep_time]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Dish created successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Failed to create dish'
    });
  }
});

module.exports = router;