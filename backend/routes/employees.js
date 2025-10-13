const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all employees
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM employees 
      WHERE is_active = true
      ORDER BY employee_id
    `);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees'
    });
  }
});

module.exports = router;