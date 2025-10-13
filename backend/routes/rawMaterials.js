const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET all raw materials
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM raw_materials 
      ORDER BY raw_material_id
    `);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch raw materials'
    });
  }
});

module.exports = router;