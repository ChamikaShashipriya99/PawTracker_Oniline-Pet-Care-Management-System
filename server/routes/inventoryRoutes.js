const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Get all inventory items
router.get('/', async (req, res) => {
    try {
        const items = await Inventory.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new inventory item
router.post('/', async (req, res) => {
    const item = new Inventory({
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        quantity: req.body.quantity,
        price: req.body.price
    });

    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update inventory item
router.put('/:id', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (req.body.name) item.name = req.body.name;
        if (req.body.category) item.category = req.body.category;
        if (req.body.description) item.description = req.body.description;
        if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
        if (req.body.price !== undefined) item.price = req.body.price;

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
    try {
        const result = await Inventory.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update stock
router.post('/:id/stock', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const amount = parseInt(req.body.amount);
        if (isNaN(amount)) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        item.quantity += amount;
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 