const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// GET all inventory items for store
router.get('/inventory', async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 